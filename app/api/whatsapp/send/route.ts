import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface SendMessageBody {
  guestId: string
  phone: string
  message: string
  eventId: string
}

async function sendViaGreenAPI(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID
  const token = process.env.GREEN_API_TOKEN

  if (!instanceId || !token) {
    // Simulation mode — mark as sent without actual sending
    return { success: true, messageId: `sim_${Date.now()}` }
  }

  // Normalize Israeli phone number to WhatsApp format
  let normalized = phone.replace(/\D/g, '')
  if (normalized.startsWith('0')) normalized = '972' + normalized.slice(1)
  if (!normalized.startsWith('972')) normalized = '972' + normalized
  const chatId = `${normalized}@c.us`

  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      }
    )
    const data = await res.json()
    if (data.idMessage) return { success: true, messageId: data.idMessage }
    return { success: false, error: data.description || 'Failed' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

async function sendViaTwilio(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM

  if (!accountSid || !authToken || !from) return { success: false, error: 'Twilio not configured' }

  let normalized = phone.replace(/\D/g, '')
  if (normalized.startsWith('0')) normalized = '972' + normalized.slice(1)
  const to = `whatsapp:+${normalized}`

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: to, Body: message }).toString(),
      }
    )
    const data = await res.json()
    if (data.sid) return { success: true, messageId: data.sid }
    return { success: false, error: data.message }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: SendMessageBody = await req.json()
    const { guestId, phone, message, eventId } = body

    if (!phone || !message) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 })
    }

    // Verify event belongs to user
    const { data: event } = await supabase
      .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Try Green API first, fall back to Twilio, then simulation
    let result
    if (process.env.GREEN_API_INSTANCE_ID) {
      result = await sendViaGreenAPI(phone, message)
    } else if (process.env.TWILIO_ACCOUNT_SID) {
      result = await sendViaTwilio(phone, message)
    } else {
      // Simulation mode
      result = { success: true, messageId: `sim_${Date.now()}_${guestId}` }
    }

    if (result.success) {
      // Update guest status in DB
      await supabase.from('guests').update({
        invitation_sent: true,
        invitation_sent_at: new Date().toISOString(),
        whatsapp_status: 'sent',
      }).eq('id', guestId)

      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      // Mark as failed
      await supabase.from('guests').update({
        whatsapp_status: 'failed',
      }).eq('id', guestId)

      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Retry failed messages
export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { eventId } = await req.json()

    // Get all failed messages for this event
    const { data: failed } = await supabase
      .from('guests')
      .select('id, phone, name')
      .eq('event_id', eventId)
      .eq('whatsapp_status', 'failed')
      .not('phone', 'is', null)

    if (!failed || failed.length === 0) {
      return NextResponse.json({ message: 'No failed messages', retried: 0 })
    }

    let retried = 0
    for (const guest of failed) {
      const result = await sendViaGreenAPI(guest.phone, `שלום ${guest.name}, שלחנו לך הזמנה לאחרונה. אנא אשר/י הגעה.`)
      if (result.success) {
        await supabase.from('guests').update({ whatsapp_status: 'sent' }).eq('id', guest.id)
        retried++
      }
    }

    return NextResponse.json({ message: `Retried ${retried}/${failed.length}`, retried })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

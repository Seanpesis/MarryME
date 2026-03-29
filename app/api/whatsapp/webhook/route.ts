import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Green API webhook handler
// Configure this URL in your Green API instance settings:
// https://yourapp.com/api/whatsapp/webhook

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient()

    // Green API webhook format
    if (body.typeWebhook === 'outgoingMessageStatus') {
      const { chatId, status } = body.messageData || {}
      if (!chatId) return NextResponse.json({ ok: true })

      // Extract phone from chatId (format: 972501234567@c.us)
      const phone = chatId.replace('@c.us', '').replace(/^972/, '0')

      let waStatus: string | null = null
      if (status === 'delivered') waStatus = 'delivered'
      if (status === 'read') waStatus = 'read'
      if (status === 'failed') waStatus = 'failed'

      if (waStatus) {
        await supabase
          .from('guests')
          .update({ whatsapp_status: waStatus })
          .eq('phone', phone)
          .in('whatsapp_status', waStatus === 'read' ? ['sent', 'delivered'] : ['sent'])
      }
    }

    // Incoming message — guest replied
    if (body.typeWebhook === 'incomingMessageReceived') {
      const { senderData, messageData } = body
      const phone = senderData?.chatId?.replace('@c.us', '').replace(/^972/, '0')
      const text = messageData?.textMessageData?.textMessage?.toLowerCase() || ''

      if (phone && text) {
        // Auto-detect confirmation/decline
        const confirmWords = ['כן', 'מגיע', 'אגיע', 'בטח', 'ok', '1', 'yes', 'אישור']
        const declineWords = ['לא', 'לא מגיע', 'לא אגיע', 'no', '2']
        const maybeWords = ['אולי', 'maybe', 'לא בטוח']

        let newStatus: string | null = null
        if (confirmWords.some(w => text.includes(w))) newStatus = 'confirmed'
        else if (declineWords.some(w => text.includes(w))) newStatus = 'declined'
        else if (maybeWords.some(w => text.includes(w))) newStatus = 'maybe'

        if (newStatus) {
          const { data: guest } = await supabase
            .from('guests')
            .select('id, party_size, name')
            .eq('phone', phone)
            .single()

          if (guest) {
            await supabase.from('guests').update({
              status: newStatus,
              confirmed_count: newStatus === 'confirmed' ? (guest.party_size || 1) : 0,
              whatsapp_status: 'read',
            }).eq('id', guest.id)
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook active', provider: 'Green API' })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Public RSVP endpoint — no auth required (guests confirm from WhatsApp link)
export async function POST(req: NextRequest) {
  try {
    const { guestId, status, count } = await req.json()

    if (!guestId || !status) {
      return NextResponse.json({ error: 'Missing guestId or status' }, { status: 400 })
    }
    if (!['confirmed', 'declined', 'maybe'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify guest exists
    const { data: existing } = await supabase
      .from('guests')
      .select('id, name, party_size, event_id')
      .eq('id', guestId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    const confirmedCount = status === 'confirmed' ? (parseInt(count) || existing.party_size || 1) : 0

    const { error } = await supabase
      .from('guests')
      .update({
        status,
        confirmed_count: confirmedCount,
        whatsapp_status: 'read',
      })
      .eq('id', guestId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, name: existing.name, confirmedCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — used by event page to fetch guest info for pre-filling RSVP
export async function GET(req: NextRequest) {
  try {
    const guestId = req.nextUrl.searchParams.get('guest')
    if (!guestId) return NextResponse.json({ guest: null })

    const supabase = createClient()
    const { data: guest } = await supabase
      .from('guests')
      .select('id, name, status, party_size, confirmed_count')
      .eq('id', guestId)
      .single()

    return NextResponse.json({ guest: guest || null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

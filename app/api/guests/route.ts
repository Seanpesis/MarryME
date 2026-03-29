import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 })

    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ guests: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Bulk import
    if (Array.isArray(body.guests)) {
      const { eventId, guests } = body

      // Verify event ownership
      const { data: event } = await supabase
        .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

      // Get existing phones to deduplicate
      const { data: existing } = await supabase
        .from('guests').select('phone').eq('event_id', eventId)
      const existingPhones = new Set(existing?.map(g => g.phone?.replace(/\D/g, '')).filter(Boolean) || [])

      const toInsert = []
      let duplicates = 0

      for (const g of guests) {
        const cleanPhone = String(g.phone || '').replace(/\D/g, '')
        if (cleanPhone && existingPhones.has(cleanPhone)) { duplicates++; continue }
        toInsert.push({
          event_id: eventId,
          name: String(g.name || '').trim(),
          phone: String(g.phone || '').trim(),
          email: String(g.email || '').trim(),
          category: g.category || 'other',
          party_size: parseInt(g.party_size) || 1,
          status: 'pending',
        })
        if (cleanPhone) existingPhones.add(cleanPhone)
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from('guests').insert(toInsert)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ imported: toInsert.length, duplicates }, { status: 201 })
    }

    // Single guest
    const { data, error } = await supabase.from('guests').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ guest: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await req.json()
    const { data, error } = await supabase
      .from('guests').update(updates).eq('id', id).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ guest: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const ids = searchParams.get('ids')?.split(',')

    if (ids && ids.length > 0) {
      await supabase.from('guests').delete().in('id', ids)
    } else if (id) {
      await supabase.from('guests').delete().eq('id', id)
    } else {
      return NextResponse.json({ error: 'id or ids required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

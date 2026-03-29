import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Public: guests on the event page can view blessings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ blessings: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Public: guests on the event page can post blessings without logging in
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_id, author_name, message } = body

    if (!event_id || !author_name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (author_name.trim().length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 })
    }
    if (message.trim().length > 1000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify event exists (public lookup)
    const { data: event } = await supabase.from('events').select('id').eq('id', event_id).single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('blessings')
      .insert({ event_id, author_name: author_name.trim(), message: message.trim() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ blessing: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Protected: only the event owner can delete blessings
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify the blessing belongs to an event owned by this user
    const { data: blessing } = await supabase
      .from('blessings')
      .select('event_id')
      .eq('id', id)
      .single()

    if (!blessing) return NextResponse.json({ error: 'Blessing not found' }, { status: 404 })

    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', blessing.event_id)
      .eq('user_id', user.id)
      .single()

    if (!event) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabase.from('blessings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

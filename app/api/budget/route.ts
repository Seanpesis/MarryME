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

    const [{ data: expenses }, { data: incomes }, { data: categories }, { data: ev }] = await Promise.all([
      supabase.from('expenses').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('incomes').select('*').eq('event_id', eventId).order('received_at', { ascending: false }),
      supabase.from('budget_categories').select('*').eq('event_id', eventId),
      supabase.from('events').select('total_budget').eq('id', eventId).single(),
    ])

    const totalExpenses = (expenses || []).reduce((a: number, e: any) => a + e.total_amount, 0)
    const totalPaid = (expenses || []).reduce((a: number, e: any) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0)
    const totalIncome = (incomes || []).reduce((a: number, i: any) => a + i.amount, 0)

    return NextResponse.json({
      expenses: expenses || [],
      incomes: incomes || [],
      categories: categories || [],
      summary: {
        totalBudget: ev?.total_budget || 0,
        totalExpenses,
        totalPaid,
        totalIncome,
        remaining: (ev?.total_budget || 0) - totalExpenses,
        balance: totalIncome - totalPaid,
      }
    })
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
    const { type, ...data } = body // type: 'expense' | 'income'

    if (type === 'income') {
      const { data: record, error } = await supabase.from('incomes').insert(data).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ record }, { status: 201 })
    }

    // expense
    const remaining = (data.total_amount || 0) - (data.advance_paid || 0) - (data.paid_amount || 0)
    const status = remaining <= 0 ? 'paid' : (data.advance_paid > 0 || data.paid_amount > 0) ? 'partial' : 'pending'
    const { data: record, error } = await supabase.from('expenses').insert({ ...data, status }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ record }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

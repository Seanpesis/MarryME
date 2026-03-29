'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Guest, Event, Table, Expense, Income, Vendor } from '@/types'

// ============= useEvent =============
export function useEvent() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const id = typeof window !== 'undefined' ? localStorage.getItem('activeEventId') : null
    if (!id) { setLoading(false); return }

    const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
    if (error) { setError(error.message); setLoading(false); return }
    setEvent(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { event, loading, error, reload: load }
}

// ============= useGuests =============
export function useGuests(eventId: string) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('name')
    setGuests(data || [])
    setLoading(false)
  }, [eventId])

  useEffect(() => { load() }, [load])

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
    declined: guests.filter(g => g.status === 'declined').length,
    maybe: guests.filter(g => g.status === 'maybe').length,
    totalPeople: guests.filter(g => g.status === 'confirmed').reduce((a, g) => a + (g.confirmed_count || 0), 0),
    withPhone: guests.filter(g => g.phone).length,
    invitationSent: guests.filter(g => g.invitation_sent).length,
  }

  return { guests, loading, stats, reload: load }
}

// ============= useBudget =============
export function useBudget(eventId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!eventId) return
    setLoading(true)

    const [{ data: ev }, { data: exp }, { data: inc }, { data: cats }] = await Promise.all([
      supabase.from('events').select('total_budget').eq('id', eventId).single(),
      supabase.from('expenses').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('incomes').select('*').eq('event_id', eventId).order('received_at', { ascending: false }),
      supabase.from('budget_categories').select('*').eq('event_id', eventId),
    ])

    setTotalBudget(ev?.total_budget || 0)
    setExpenses(exp || [])
    setIncomes(inc || [])
    setCategories(cats || [])
    setLoading(false)
  }, [eventId])

  useEffect(() => { load() }, [load])

  const summary = {
    totalBudget,
    totalExpenses: expenses.reduce((a, e) => a + e.total_amount, 0),
    totalPaid: expenses.reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0),
    totalIncome: incomes.reduce((a, i) => a + i.amount, 0),
    get remaining() { return this.totalBudget - this.totalExpenses },
    get balance() { return this.totalIncome - this.totalPaid },
    get budgetUsedPct() { return this.totalBudget > 0 ? Math.round((this.totalExpenses / this.totalBudget) * 100) : 0 },
  }

  return { expenses, incomes, categories, summary, loading, reload: load }
}

// ============= useTables =============
export function useTables(eventId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    const { data } = await supabase.from('tables').select('*').eq('event_id', eventId).order('name')
    setTables(data || [])
    setLoading(false)
  }, [eventId])

  useEffect(() => { load() }, [load])

  return { tables, loading, reload: load }
}

// ============= useVendors =============
export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .order('is_recommended', { ascending: false })
      .order('rating', { ascending: false })
    setVendors(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { vendors, loading, reload: load }
}

// ============= useAuth =============
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

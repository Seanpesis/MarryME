'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Download, FileText, Users, DollarSign, LayoutGrid,
  TrendingUp, Loader2, Printer, Share2, CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { BudgetPieChart, GuestDonut } from '@/components/charts'
import { formatCurrency, formatDateHebrew } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [event, setEvent] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    if (id) loadAll(id)
  }, [])

  const loadAll = async (id: string) => {
    setLoading(true)
    const [{ data: ev }, { data: gs }, { data: exp }, { data: inc }, { data: cats }, { data: tbls }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('guests').select('*').eq('event_id', id).order('name'),
      supabase.from('expenses').select('*').eq('event_id', id),
      supabase.from('incomes').select('*').eq('event_id', id),
      supabase.from('budget_categories').select('*').eq('event_id', id),
      supabase.from('tables').select('*').eq('event_id', id).order('name'),
    ])
    setEvent(ev); setGuests(gs || []); setExpenses(exp || [])
    setIncomes(inc || []); setCategories(cats || []); setTables(tbls || [])
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
    toast.success('מדפיס...')
  }

  const handleExportGuestList = () => {
    const rows = [
      ['שם', 'טלפון', 'אימייל', 'סטטוס', 'קטגוריה', 'מספר אנשים', 'שולחן', 'הערות'],
      ...guests.map(g => [
        g.name, g.phone, g.email,
        g.status === 'confirmed' ? 'אישר' : g.status === 'pending' ? 'ממתין' : g.status === 'declined' ? 'לא מגיע' : 'אולי',
        g.category === 'family' ? 'משפחה' : g.category === 'friends' ? 'חברים' : g.category === 'work' ? 'עבודה' : 'אחר',
        g.party_size,
        tables.find(t => t.id === g.table_id)?.name || '',
        g.notes,
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `רשימת-אורחים-${event?.name || 'אירוע'}.csv`
    a.click()
    toast.success('הורד ✓')
  }

  const handleExportBudget = () => {
    const rows = [
      ['תיאור', 'קטגוריה', 'סכום כולל', 'מקדמה', 'שולם', 'יתרה', 'סטטוס'],
      ...expenses.map(e => [
        e.description,
        categories.find(c => c.id === e.category_id)?.name || '',
        e.total_amount, e.advance_paid, e.paid_amount,
        e.total_amount - (e.advance_paid || 0) - (e.paid_amount || 0),
        e.status === 'paid' ? 'שולם' : e.status === 'partial' ? 'חלקי' : 'ממתין',
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `תקציב-${event?.name || 'אירוע'}.csv`
    a.click()
    toast.success('הורד ✓')
  }

  const totalExpenses = expenses.reduce((a, e) => a + e.total_amount, 0)
  const totalPaid = expenses.reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0)
  const totalIncome = incomes.reduce((a, i) => a + i.amount, 0)
  const confirmedGuests = guests.filter(g => g.status === 'confirmed')
  const confirmedPeople = confirmedGuests.reduce((a, g) => a + (g.confirmed_count || g.party_size || 1), 0)
  const assignedGuests = guests.filter(g => g.table_id && g.status === 'confirmed')

  const budgetByCategory = categories.map(cat => ({
    name: cat.name,
    value: expenses.filter(e => e.category_id === cat.id).reduce((a, e) => a + e.total_amount, 0),
  })).filter(c => c.value > 0)

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-brown">דוחות וסיכומים</h1>
          <p className="text-stone-500 font-hebrew text-sm mt-1">יצוא ודוחות מלאים לאירוע</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handlePrint} className="btn-secondary text-sm py-2">
            <Printer className="w-4 h-4" />
            הדפס
          </button>
        </div>
      </div>

      {/* Quick exports */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, title: 'רשימת אורחים', desc: `${guests.length} מוזמנים`, color: 'text-champagne-600 bg-champagne-50', action: handleExportGuestList },
          { icon: DollarSign, title: 'דוח תקציב', desc: `${expenses.length} הוצאות`, color: 'text-amber-600 bg-amber-50', action: handleExportBudget },
          { icon: LayoutGrid, title: 'סידורי הושבה', desc: `${tables.length} שולחנות`, color: 'text-sage-600 bg-sage-50', action: handlePrint },
        ].map(item => (
          <button
            key={item.title}
            onClick={item.action}
            className="card-hover flex items-center gap-4 text-right group"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-dark-brown font-hebrew">{item.title}</p>
              <p className="text-xs text-stone-400 font-hebrew">{item.desc}</p>
            </div>
            <Download className="w-4 h-4 text-stone-300 group-hover:text-champagne-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* ===== PRINTABLE REPORT ===== */}
      <div ref={printRef} className="space-y-6 print:space-y-4">

        {/* Event header - print */}
        <div className="card print:border print:border-stone-300 print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">💍</div>
                <h2 className="font-display text-2xl font-bold text-dark-brown">{event?.name}</h2>
              </div>
              {event?.date && (
                <p className="text-stone-500 font-hebrew">📅 {formatDateHebrew(event.date, 'full')}</p>
              )}
              {event?.venue && <p className="text-stone-500 font-hebrew">📍 {event.venue}{event.venue_address ? ` • ${event.venue_address}` : ''}</p>}
            </div>
            <div className="text-left bg-champagne-50 rounded-2xl px-5 py-3">
              {event?.date && (
                <>
                  <p className="text-xs text-champagne-600 font-hebrew">נותרו</p>
                  <p className="text-3xl font-bold font-display text-champagne-700">
                    {Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-xs text-champagne-600 font-hebrew">ימים</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Guest summary */}
        <div className="card print:border print:border-stone-300 print:shadow-none">
          <h3 className="font-bold text-dark-brown font-hebrew text-lg mb-5">סיכום מוזמנים</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'סה״כ הוזמנו', value: guests.length, icon: '👥', color: 'bg-stone-50' },
              { label: 'אישרו הגעה', value: confirmedGuests.length, sub: `${confirmedPeople} אנשים`, icon: '✅', color: 'bg-sage-50' },
              { label: 'ממתינים', value: guests.filter(g => g.status === 'pending').length, icon: '⏳', color: 'bg-amber-50' },
              { label: 'לא מגיעים', value: guests.filter(g => g.status === 'declined').length, icon: '❌', color: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center border border-stone-100`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold font-display text-dark-brown">{s.value}</p>
                <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
                {s.sub && <p className="text-xs text-stone-400 font-hebrew">{s.sub}</p>}
              </div>
            ))}
          </div>

          <div className="print:hidden">
            <GuestDonut
              confirmed={confirmedGuests.length}
              pending={guests.filter(g => g.status === 'pending').length}
              declined={guests.filter(g => g.status === 'declined').length}
              maybe={guests.filter(g => g.status === 'maybe').length}
            />
          </div>

          {/* Stats by category */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'משפחה', icon: '👨‍👩‍👧', count: guests.filter(g => g.category === 'family').length },
              { label: 'חברים', icon: '👥', count: guests.filter(g => g.category === 'friends').length },
              { label: 'עבודה', icon: '💼', count: guests.filter(g => g.category === 'work').length },
              { label: 'אחר', icon: '📋', count: guests.filter(g => g.category === 'other').length },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg text-sm font-hebrew">
                <span>{c.icon}</span>
                <span className="text-stone-600">{c.label}:</span>
                <span className="font-bold text-dark-brown">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget summary */}
        <div className="card print:border print:border-stone-300 print:shadow-none">
          <h3 className="font-bold text-dark-brown font-hebrew text-lg mb-5">סיכום תקציב</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'תקציב כולל', value: event?.total_budget || 0, color: 'bg-stone-50' },
              { label: 'סה״כ הוצאות', value: totalExpenses, color: 'bg-amber-50' },
              { label: 'שולם עד כה', value: totalPaid, color: 'bg-red-50' },
              { label: 'הכנסות', value: totalIncome, color: 'bg-sage-50' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center border border-stone-100`}>
                <p className="text-lg font-bold font-display text-dark-brown">₪{s.value.toLocaleString('he-IL')}</p>
                <p className="text-xs text-stone-500 font-hebrew mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {budgetByCategory.length > 0 && (
            <>
              <div className="print:hidden">
                <BudgetPieChart data={budgetByCategory} />
              </div>
              {/* Category breakdown table */}
              <div className="space-y-2 mt-4">
                {categories.map(cat => {
                  const catExpenses = expenses.filter(e => e.category_id === cat.id)
                  if (catExpenses.length === 0) return null
                  const catTotal = catExpenses.reduce((a, e) => a + e.total_amount, 0)
                  const catPaid = catExpenses.reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0)
                  return (
                    <div key={cat.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 text-sm font-hebrew">
                      <span className="text-base">{cat.icon}</span>
                      <span className="flex-1 text-stone-700">{cat.name}</span>
                      <span className="text-stone-400 text-xs">שולם: ₪{catPaid.toLocaleString()}</span>
                      <span className="font-bold text-dark-brown">₪{catTotal.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Seating summary */}
        {tables.length > 0 && (
          <div className="card print:border print:border-stone-300 print:shadow-none">
            <h3 className="font-bold text-dark-brown font-hebrew text-lg mb-4">סידורי הושבה</h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'שולחנות', value: tables.length },
                { label: 'מקומות זמינים', value: tables.reduce((a, t) => a + t.capacity, 0) },
                { label: 'משובצים', value: assignedGuests.length },
              ].map(s => (
                <div key={s.label} className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                  <p className="text-xl font-bold font-display text-dark-brown">{s.value}</p>
                  <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tables.map(table => {
                const tGuests = guests.filter(g => g.table_id === table.id)
                const tPeople = tGuests.reduce((a, g) => a + (g.confirmed_count || g.party_size || 1), 0)
                return (
                  <div key={table.id} className={`p-3 rounded-xl border text-sm font-hebrew ${tPeople >= table.capacity ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-dark-brown">{table.name}</span>
                      <span className={`text-xs ${tPeople >= table.capacity ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>{tPeople}/{table.capacity}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tGuests.map(g => (
                        <span key={g.id} className="bg-champagne-50 text-champagne-700 text-xs px-1.5 py-0.5 rounded-full border border-champagne-200">
                          {g.name}
                        </span>
                      ))}
                      {tGuests.length === 0 && <span className="text-stone-300 text-xs">ריק</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-stone-400 pt-4 border-t border-stone-200">
          <p>דוח נוצר ב-{new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })} • SimchaLink</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print, nav, header, aside { display: none !important; }
          .card { box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

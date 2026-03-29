'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Users, CheckCircle2, Clock, XCircle, MessageCircle,
  DollarSign, LayoutGrid, Calendar, MapPin, Loader2, Edit2,
  TrendingUp, AlertTriangle, Sparkles, Heart, FileText,
  Globe, Search, Bell, ChevronRight, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { GuestDonut, RsvpAreaChart } from '@/components/charts'
import { RealtimeIndicator } from '@/components/dashboard/RealtimeProvider'
import toast from 'react-hot-toast'

/* ─────────────────── CREATE EVENT MODAL ─────────────────── */
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: (ev: any) => void }) {
  const [form, setForm] = useState({
    name: '', bride_name: '', groom_name: '', date: '',
    venue: '', venue_address: '', total_budget: ''
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('events').insert({
      user_id: user.id,
      name: form.name || `חתונת ${form.bride_name} ו${form.groom_name}`,
      bride_name: form.bride_name,
      groom_name: form.groom_name,
      date: form.date,
      venue: form.venue,
      venue_address: form.venue_address,
      total_budget: parseFloat(form.total_budget) || 0,
    }).select().single()

    if (error) { toast.error('שגיאה ביצירת האירוע'); setLoading(false); return }
    try { await supabase.rpc('create_default_budget_categories', { p_event_id: data.id }) } catch {}
    toast.success('🎉 האירוע נוצר בהצלחה!')
    localStorage.setItem('activeEventId', data.id)
    onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-dark-brown">יצירת אירוע חדש</h2>
              <p className="text-stone-500 text-sm font-hebrew">מלאו את פרטי האירוע שלכם</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם הכלה 👰</label>
              <input type="text" value={form.bride_name} onChange={e => u('bride_name', e.target.value)} placeholder="יעל" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם החתן 🤵</label>
              <input type="text" value={form.groom_name} onChange={e => u('groom_name', e.target.value)} placeholder="אורי" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם האירוע</label>
            <input type="text" value={form.name} onChange={e => u('name', e.target.value)}
              placeholder={form.bride_name && form.groom_name ? `חתונת ${form.bride_name} ו${form.groom_name}` : 'שם האירוע'}
              className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">
              <Calendar className="w-4 h-4 inline ml-1" />תאריך האירוע *
            </label>
            <input type="date" value={form.date} onChange={e => u('date', e.target.value)} required className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם האולם</label>
            <input type="text" value={form.venue} onChange={e => u('venue', e.target.value)} placeholder="אולם הגן הסגור" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">
              <MapPin className="w-4 h-4 inline ml-1" />כתובת
            </label>
            <input type="text" value={form.venue_address} onChange={e => u('venue_address', e.target.value)} placeholder="רחוב הורד 12, כפר סבא" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">
              <DollarSign className="w-4 h-4 inline ml-1" />תקציב כולל (₪)
            </label>
            <input type="number" value={form.total_budget} onChange={e => u('total_budget', e.target.value)} placeholder="120000" min="0" className="input-field" dir="ltr" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'יוצר...' : 'צור אירוע!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────── QUICK ACTION CARD ─────────────────── */
function QuickAction({ href, icon, label, color, badge }: {
  href: string; icon: string; label: string; color: string; badge?: number
}) {
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 font-hebrew text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${color}`}>
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

/* ─────────────────── ACTIVITY FEED ─────────────────── */
function ActivityItem({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
      <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0 text-sm`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-hebrew text-stone-700 truncate">{text}</p>
      </div>
      <span className="text-xs text-stone-300 font-hebrew shrink-0">{time}</span>
    </div>
  )
}

/* ─────────────────── MAIN DASHBOARD ─────────────────── */
export default function DashboardPage() {
  const [event, setEvent] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, declined: 0, maybe: 0, confirmedPeople: 0, invitationSent: 0 })
  const [budget, setBudget] = useState({ total: 0, spent: 0, income: 0, remaining: 0 })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [rsvpTrend, setRsvpTrend] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tableCount, setTableCount] = useState(0)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: events } = await supabase
      .from('events').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1)

    if (!events || events.length === 0) {
      setLoading(false)
      setShowCreate(true)
      return
    }

    const ev = events[0]
    setEvent(ev)
    localStorage.setItem('activeEventId', ev.id)

    const [
      { data: guests },
      { data: expenses },
      { data: incomes },
      { data: tables },
      { data: recentGuests },
    ] = await Promise.all([
      supabase.from('guests').select('status, confirmed_count, party_size, invitation_sent').eq('event_id', ev.id),
      supabase.from('expenses').select('advance_paid, paid_amount').eq('event_id', ev.id),
      supabase.from('incomes').select('amount').eq('event_id', ev.id),
      supabase.from('tables').select('id').eq('event_id', ev.id),
      supabase.from('guests').select('name, status, created_at').eq('event_id', ev.id)
        .order('created_at', { ascending: false }).limit(8),
    ])

    if (guests) {
      const confirmed = guests.filter(g => g.status === 'confirmed')
      setStats({
        total: guests.length,
        confirmed: confirmed.length,
        pending: guests.filter(g => g.status === 'pending').length,
        declined: guests.filter(g => g.status === 'declined').length,
        maybe: guests.filter(g => g.status === 'maybe').length,
        confirmedPeople: confirmed.reduce((a, g) => a + (g.confirmed_count || g.party_size || 1), 0),
        invitationSent: guests.filter(g => g.invitation_sent).length,
      })

      // Build RSVP trend (simulate weekly data points)
      const confirmedSoFar = confirmed.length
      const trend = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1.0].map((pct, i) => ({
        date: `שבוע ${i + 1}`,
        confirmed: Math.round(confirmedSoFar * pct),
        pending: Math.round(guests.filter(g => g.status === 'pending').length * (1 - pct * 0.3)),
        declined: Math.round(guests.filter(g => g.status === 'declined').length * pct),
      }))
      setRsvpTrend(trend)
    }

    if (expenses && incomes) {
      const spent = expenses.reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0)
      const income = incomes.reduce((a, i) => a + (i.amount || 0), 0)
      setBudget({ total: ev.total_budget || 0, spent, income, remaining: (ev.total_budget || 0) - spent })
    }

    setTableCount(tables?.length || 0)

    if (recentGuests) {
      setRecentActivity(recentGuests.map(g => ({
        icon: g.status === 'confirmed' ? '✅' : g.status === 'declined' ? '❌' : '👤',
        text: g.status === 'confirmed' ? `${g.name} אישר/ה הגעה` :
              g.status === 'declined' ? `${g.name} לא יוכל/תוכל להגיע` : `${g.name} נוסף לרשימה`,
        time: new Date(g.created_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
        color: g.status === 'confirmed' ? 'bg-sage-100 text-sage-600' :
               g.status === 'declined' ? 'bg-red-100 text-red-600' : 'bg-champagne-100 text-champagne-600',
      })))
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Real-time subscription
  useEffect(() => {
    const eventId = localStorage.getItem('activeEventId')
    if (!eventId) return

    const channel = supabase
      .channel(`dashboard-${eventId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}`
      }, (payload: any) => {
        const g = payload.new
        if (g.status === 'confirmed' && payload.old?.status !== 'confirmed') {
          toast.success(`🎉 ${g.name} אישר/ה הגעה!`, { duration: 5000 })
          loadData()
        } else if (g.status === 'declined' && payload.old?.status !== 'declined') {
          toast(`😔 ${g.name} לא יוכל להגיע`, { duration: 4000, icon: '❌' })
          loadData()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event?.id, loadData])

  const daysUntil = event?.date ? Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000) : null
  const budgetPct = budget.total > 0 ? Math.min(Math.round((budget.spent / budget.total) * 100), 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-champagne-200 border-t-champagne-500 rounded-full animate-spin" />
        <p className="font-hebrew text-stone-400 text-sm">טוען נתונים...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="flex items-center justify-center min-h-96 p-8">
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={(ev) => { setEvent(ev); setShowCreate(false); loadData() }}
        />
      )}
      <div className="text-center space-y-6 max-w-md">
        <div className="text-7xl animate-bounce">💍</div>
        <h2 className="font-display text-3xl font-bold text-dark-brown">ברוכים הבאים ל-SimchaLink!</h2>
        <p className="text-stone-500 font-hebrew leading-relaxed">
          צרו את האירוע הראשון שלכם וקבלו גישה לכל הכלים לניהול החתונה המושלמת.
        </p>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-base px-10 py-4 rounded-2xl">
          <Plus className="w-5 h-5" />
          צור אירוע ראשון
        </button>
      </div>
    </div>
  )

  return (
    <>
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={(ev) => { setEvent(ev); setShowCreate(false); loadData() }}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

        {/* ── EVENT HERO ── */}
        <div className="relative bg-dark-brown rounded-3xl overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(220,146,41,0.2)_0%,transparent_70%)]" />
          <div className="absolute top-4 left-4 opacity-10 text-6xl pointer-events-none">💍</div>
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-champagne-400 font-hebrew text-sm">האירוע שלכם</p>
                <RealtimeIndicator />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-stone-400 text-sm font-hebrew">
                {event.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {event.venue}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {daysUntil !== null && daysUntil > 0 && (
                <div className="text-center bg-champagne-600/20 border border-champagne-500/30 rounded-2xl px-5 py-3">
                  <p className="text-champagne-300 text-xs font-hebrew">נותרו</p>
                  <p className="text-white font-bold font-display text-4xl leading-none">{daysUntil}</p>
                  <p className="text-champagne-300 text-xs font-hebrew mt-0.5">ימים</p>
                </div>
              )}
              {daysUntil !== null && daysUntil <= 0 && (
                <div className="bg-sage-600/20 border border-sage-500/30 rounded-2xl px-5 py-3 text-center">
                  <p className="text-sage-300 font-hebrew text-sm">🎊 מזל טוב!</p>
                </div>
              )}
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-hebrew hover:bg-white/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                עריכה
              </button>
            </div>
          </div>
        </div>

        {/* ── TOP STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/dashboard/guests',
              icon: <Users className="w-6 h-6 text-white" />,
              color: 'bg-gradient-to-br from-champagne-400 to-champagne-600',
              value: stats.total,
              label: 'מוזמנים',
              sub: `${stats.confirmedPeople} אנשים מגיעים`,
            },
            {
              href: '/dashboard/guests',
              icon: <CheckCircle2 className="w-6 h-6 text-white" />,
              color: 'bg-gradient-to-br from-sage-400 to-sage-600',
              value: stats.confirmed,
              label: 'אישרו הגעה',
              sub: stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}% מהרשימה` : '',
            },
            {
              href: '/dashboard/invitations',
              icon: <MessageCircle className="w-6 h-6 text-white" />,
              color: 'bg-gradient-to-br from-[#25d366] to-[#128c7e]',
              value: stats.invitationSent,
              label: 'הזמנות נשלחו',
              sub: `${stats.total - stats.invitationSent} טרם נשלחו`,
            },
            {
              href: '/dashboard/budget',
              icon: <DollarSign className="w-6 h-6 text-white" />,
              color: budgetPct > 90
                ? 'bg-gradient-to-br from-red-400 to-red-600'
                : 'bg-gradient-to-br from-amber-400 to-amber-600',
              value: `₪${budget.remaining.toLocaleString('he-IL')}`,
              label: 'נותר בתקציב',
              sub: `${budgetPct}% נוצל`,
            },
          ].map((s, i) => (
            <Link key={i} href={s.href} className="card-hover flex items-start gap-3 group">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold font-display text-dark-brown truncate">{s.value}</p>
                <p className="text-stone-500 font-hebrew text-xs">{s.label}</p>
                {s.sub && <p className="text-stone-400 text-xs font-hebrew mt-0.5 truncate">{s.sub}</p>}
              </div>
            </Link>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <h2 className="font-bold text-dark-brown font-hebrew mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-champagne-500" />
            פעולות מהירות
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <QuickAction href="/dashboard/guests" icon="👤" label="הוסף מוזמן" color="bg-champagne-50 border-champagne-200 text-champagne-700 hover:bg-champagne-100" />
            <QuickAction href="/dashboard/invitations" icon="💬" label="שלח הזמנות" color="bg-green-50 border-green-200 text-green-700 hover:bg-green-100" badge={stats.total - stats.invitationSent} />
            <QuickAction href="/dashboard/tables" icon="🪑" label="הושבה" color="bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100" />
            <QuickAction href="/dashboard/budget" icon="💰" label="תקציב" color="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" />
            <QuickAction href="/dashboard/vendors" icon="🔍" label="ספקים" color="bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100" />
            <QuickAction href="/dashboard/event-site" icon="🌐" label="אתר" color="bg-blush-50 border-blush-200 text-blush-700 hover:bg-blush-100" />
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Guest status donut */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-brown font-hebrew">סטטוס מוזמנים</h3>
              <Link href="/dashboard/guests" className="text-xs text-champagne-600 hover:underline font-hebrew flex items-center gap-1">
                הכל <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {stats.total === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 opacity-30">👥</div>
                <p className="text-stone-400 font-hebrew text-sm">אין מוזמנים עדיין</p>
                <Link href="/dashboard/guests" className="btn-primary text-xs mt-3 inline-flex">
                  <Plus className="w-3 h-3" />הוסף
                </Link>
              </div>
            ) : (
              <GuestDonut
                confirmed={stats.confirmed}
                pending={stats.pending}
                declined={stats.declined}
                maybe={stats.maybe}
              />
            )}
          </div>

          {/* RSVP Trend chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-brown font-hebrew">מגמת אישורים</h3>
              <span className="text-xs text-stone-400 font-hebrew">7 שבועות אחרונים</span>
            </div>
            {rsvpTrend.length > 0 ? (
              <RsvpAreaChart data={rsvpTrend} />
            ) : (
              <div className="h-48 flex items-center justify-center text-stone-300 text-sm font-hebrew">
                אין מספיק נתונים עדיין
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-brown font-hebrew flex items-center gap-2">
                <Bell className="w-4 h-4 text-champagne-500" />
                פעילות אחרונה
              </h3>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-stone-300">
                <p className="font-hebrew text-sm">אין פעילות עדיין</p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((a, i) => (
                  <ActivityItem key={i} {...a} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BUDGET OVERVIEW ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-dark-brown font-hebrew text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-champagne-500" />
              סיכום תקציב
            </h3>
            <Link href="/dashboard/budget" className="text-sm text-champagne-600 hover:underline font-hebrew flex items-center gap-1">
              לניהול מלא <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'תקציב כולל', value: budget.total, icon: '🎯', color: 'text-dark-brown' },
              { label: 'שולם', value: budget.spent, icon: '💳', color: 'text-red-600' },
              { label: 'נותר לתשלום', value: budget.remaining, icon: '⏳', color: budget.remaining < 0 ? 'text-red-600' : 'text-amber-600' },
              { label: 'הכנסות', value: budget.income, icon: '💚', color: 'text-sage-600' },
            ].map(b => (
              <div key={b.label} className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                <p className="text-xl mb-1">{b.icon}</p>
                <p className={`text-lg font-bold font-display ${b.color}`}>₪{b.value.toLocaleString('he-IL')}</p>
                <p className="text-xs text-stone-500 font-hebrew">{b.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-hebrew text-stone-600 mb-2">
              <span>ניצול תקציב</span>
              <span className={`font-bold ${budgetPct > 90 ? 'text-red-600' : budgetPct > 70 ? 'text-amber-600' : 'text-stone-600'}`}>
                {budgetPct}%
                {budgetPct > 90 && <AlertTriangle className="w-4 h-4 inline mr-1" />}
              </span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  budgetPct > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  budgetPct > 70 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                  'bg-gradient-to-r from-champagne-400 to-champagne-600'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── SEATING + EVENT SITE MINI CARDS ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard/tables" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold font-hebrew text-dark-brown">סידורי הושבה</p>
              <p className="text-sm text-stone-400 font-hebrew">
                {tableCount > 0 ? `${tableCount} שולחנות • ${stats.confirmed} אורחים מאושרים` : 'לחץ להתחיל לתכנן'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 mr-auto" />
          </Link>

          <Link href="/dashboard/event-site" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blush-400 to-blush-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold font-hebrew text-dark-brown">אתר האירוע</p>
              <p className="text-sm text-stone-400 font-hebrew">
                {event?.venue ? `simchalink.app/e/${event.id?.slice(0,8)}` : 'הגדר את אתר האירוע שלך'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 mr-auto" />
          </Link>
        </div>

      </div>
    </>
  )
}

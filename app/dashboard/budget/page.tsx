'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit2, DollarSign, TrendingUp, TrendingDown,
  Check, X, Loader2, ChevronDown, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

interface Category { id: string; name: string; icon: string; color: string }
interface Expense {
  id: string; category_id: string; description: string
  total_amount: number; advance_paid: number; paid_amount: number
  status: string; due_date?: string; notes?: string; vendor_id?: string
}
interface Income { id: string; source: string; amount: number; received_at: string; notes?: string }

function ExpenseModal({ expense, categories, eventId, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    description: expense?.description || '',
    category_id: expense?.category_id || (categories[0]?.id || ''),
    total_amount: String(expense?.total_amount || ''),
    advance_paid: String(expense?.advance_paid || ''),
    paid_amount: String(expense?.paid_amount || ''),
    due_date: expense?.due_date || '',
    notes: expense?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const remaining = (parseFloat(form.total_amount) || 0) - (parseFloat(form.advance_paid) || 0) - (parseFloat(form.paid_amount) || 0)
  const status = remaining <= 0 ? 'paid' : (parseFloat(form.advance_paid) > 0 || parseFloat(form.paid_amount) > 0) ? 'partial' : 'pending'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      event_id: eventId,
      description: form.description,
      category_id: form.category_id || null,
      total_amount: parseFloat(form.total_amount) || 0,
      advance_paid: parseFloat(form.advance_paid) || 0,
      paid_amount: parseFloat(form.paid_amount) || 0,
      due_date: form.due_date || null,
      notes: form.notes,
      status,
    }
    const { error } = expense?.id
      ? await supabase.from('expenses').update(payload).eq('id', expense.id)
      : await supabase.from('expenses').insert(payload)

    if (error) { toast.error('שגיאה בשמירה'); setLoading(false); return }
    toast.success('נשמר ✓')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew text-lg">{expense?.id ? 'עריכת הוצאה' : 'הוספת הוצאה'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">תיאור *</label>
            <input type="text" value={form.description} onChange={e => update('description', e.target.value)} required className="input-field" placeholder="כלה צלם, תשלום ראשון..." />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קטגוריה</label>
            <select value={form.category_id} onChange={e => update('category_id', e.target.value)} className="input-field">
              {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סכום כולל (₪)</label>
            <input type="number" value={form.total_amount} onChange={e => update('total_amount', e.target.value)} required min="0" className="input-field" dir="ltr" placeholder="15000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מקדמה ששולמה (₪)</label>
              <input type="number" value={form.advance_paid} onChange={e => update('advance_paid', e.target.value)} min="0" className="input-field" dir="ltr" placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שולם נוסף (₪)</label>
              <input type="number" value={form.paid_amount} onChange={e => update('paid_amount', e.target.value)} min="0" className="input-field" dir="ltr" placeholder="0" />
            </div>
          </div>

          {/* Remaining preview */}
          <div className={`rounded-xl p-3 text-sm font-hebrew ${remaining <= 0 ? 'bg-sage-50 border border-sage-200 text-sage-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            <div className="flex justify-between">
              <span>יתרה לתשלום:</span>
              <span className="font-bold">₪{Math.max(0, remaining).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-70">
              <span>סטטוס:</span>
              <span>{remaining <= 0 ? '✅ שולם במלואו' : remaining < (parseFloat(form.total_amount) || 0) ? '⚡ שולם חלקית' : '⏳ טרם שולם'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">תאריך לתשלום</label>
            <input type="date" value={form.due_date} onChange={e => update('due_date', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IncomeModal({ income, eventId, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    source: income?.source || '',
    amount: String(income?.amount || ''),
    received_at: income?.received_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    notes: income?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { event_id: eventId, source: form.source, amount: parseFloat(form.amount) || 0, received_at: form.received_at, notes: form.notes }
    const { error } = income?.id
      ? await supabase.from('incomes').update(payload).eq('id', income.id)
      : await supabase.from('incomes').insert(payload)

    if (error) { toast.error('שגיאה'); setLoading(false); return }
    toast.success('נשמר ✓')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-luxury w-full max-w-sm">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew">{income?.id ? 'עריכת הכנסה' : 'הוספת הכנסה'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מקור</label>
            <input type="text" value={form.source} onChange={e => update('source', e.target.value)} required className="input-field" placeholder="מתנות, הורי הכלה..." />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סכום (₪)</label>
            <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} required min="0" className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">תאריך קבלה</label>
            <input type="date" value={form.received_at} onChange={e => update('received_at', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} className="input-field resize-none" rows={2} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [editIncome, setEditIncome] = useState<Income | null>(null)
  const [eventId, setEventId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    setEventId(id)
    if (id) loadData(id)
  }, [])

  const loadData = async (id?: string) => {
    const eid = id || eventId
    if (!eid) return
    setLoading(true)

    const [{ data: ev }, { data: exp }, { data: inc }, { data: cats }] = await Promise.all([
      supabase.from('events').select('total_budget').eq('id', eid).single(),
      supabase.from('expenses').select('*').eq('event_id', eid).order('created_at', { ascending: false }),
      supabase.from('incomes').select('*').eq('event_id', eid).order('received_at', { ascending: false }),
      supabase.from('budget_categories').select('*').eq('event_id', eid),
    ])

    setTotalBudget(ev?.total_budget || 0)
    setExpenses(exp || [])
    setIncomes(inc || [])
    setCategories(cats || [])
    setLoading(false)
  }

  const totalExpenses = expenses.reduce((a, e) => a + e.total_amount, 0)
  const totalPaid = expenses.reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0)
  const totalRemaining = totalExpenses - totalPaid
  const totalIncome = incomes.reduce((a, i) => a + i.amount, 0)
  const balance = totalIncome - totalPaid
  const budgetLeft = totalBudget - totalExpenses

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '—'
  const getCategoryIcon = (id: string) => categories.find(c => c.id === id)?.icon || '💰'

  // Group expenses by category for chart
  const byCategory = categories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category_id === cat.id).reduce((a, e) => a + e.total_amount, 0),
    paid: expenses.filter(e => e.category_id === cat.id).reduce((a, e) => a + (e.advance_paid || 0) + (e.paid_amount || 0), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <>
      {showExpenseModal && (
        <ExpenseModal
          expense={editExpense}
          categories={categories}
          eventId={eventId}
          onClose={() => { setShowExpenseModal(false); setEditExpense(null) }}
          onSaved={() => { setShowExpenseModal(false); setEditExpense(null); loadData() }}
        />
      )}
      {showIncomeModal && (
        <IncomeModal
          income={editIncome}
          eventId={eventId}
          onClose={() => { setShowIncomeModal(false); setEditIncome(null) }}
          onSaved={() => { setShowIncomeModal(false); setEditIncome(null); loadData() }}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-brown">ניהול תקציב</h1>
            <p className="text-stone-500 font-hebrew text-sm mt-1">עקוב אחר הוצאות, הכנסות ויתרות</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditIncome(null); setShowIncomeModal(true) }} className="btn-secondary text-sm py-2">
              <TrendingUp className="w-4 h-4" />
              הכנסה
            </button>
            <button onClick={() => { setEditExpense(null); setShowExpenseModal(true) }} className="btn-primary text-sm py-2">
              <Plus className="w-4 h-4" />
              הוצאה חדשה
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'תקציב כולל', value: totalBudget, color: 'text-dark-brown', bg: 'bg-stone-50', icon: '🎯' },
            { label: 'סה״כ הוצאות', value: totalExpenses, color: 'text-amber-700', bg: 'bg-amber-50', icon: '💸' },
            { label: 'שולם עד כה', value: totalPaid, color: 'text-red-700', bg: 'bg-red-50', icon: '💳' },
            { label: 'הכנסות', value: totalIncome, color: 'text-sage-700', bg: 'bg-sage-50', icon: '💰' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-stone-100`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className={`text-xl font-bold font-display ${s.color}`}>₪{s.value.toLocaleString('he-IL')}</p>
              <p className="text-xs text-stone-500 font-hebrew mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Budget progress */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-dark-brown font-hebrew">ניצול תקציב</h3>
            {budgetLeft < 0 && (
              <div className="flex items-center gap-1 text-red-600 text-sm font-hebrew">
                <AlertTriangle className="w-4 h-4" />
                חריגה של ₪{Math.abs(budgetLeft).toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold font-display text-amber-600">₪{totalRemaining.toLocaleString()}</p>
              <p className="text-xs text-stone-500 font-hebrew">נשאר לשלם</p>
            </div>
            <div>
              <p className={`text-lg font-bold font-display ${balance >= 0 ? 'text-sage-600' : 'text-red-600'}`}>
                {balance >= 0 ? '+' : ''}₪{balance.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 font-hebrew">מאזן (הכנסות - שולם)</p>
            </div>
            <div>
              <p className={`text-lg font-bold font-display ${budgetLeft >= 0 ? 'text-sage-600' : 'text-red-600'}`}>
                {budgetLeft >= 0 ? '+' : ''}₪{budgetLeft.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 font-hebrew">נותר בתקציב</p>
            </div>
          </div>

          {totalBudget > 0 && (
            <div>
              <div className="progress-bar h-3">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    totalExpenses > totalBudget ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    totalExpenses / totalBudget > 0.8 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    'bg-gradient-to-r from-champagne-400 to-champagne-600'
                  }`}
                  style={{ width: `${Math.min((totalExpenses / totalBudget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-stone-400 font-hebrew mt-1">
                {Math.round((totalExpenses / totalBudget) * 100)}% מהתקציב הוקצה להוצاות
              </p>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-dark-brown font-hebrew mb-4">פירוט לפי קטגוריה</h3>
            <div className="space-y-3">
              {byCategory.map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-sm font-hebrew mb-1">
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-stone-700">{cat.name}</span>
                    </span>
                    <div className="text-left">
                      <span className="font-bold text-dark-brown">₪{cat.total.toLocaleString()}</span>
                      <span className="text-stone-400 text-xs mr-2">(שולם: ₪{cat.paid.toLocaleString()})</span>
                    </div>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-champagne-400 to-champagne-600"
                      style={{ width: `${totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs: Expenses / Income */}
        <div className="card p-0 overflow-hidden">
          <div className="flex border-b border-stone-100">
            {[
              { key: 'expenses', label: `הוצאות (${expenses.length})`, icon: TrendingDown },
              { key: 'income', label: `הכנסות (${incomes.length})`, icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-hebrew font-semibold transition-colors ${
                  activeTab === key
                    ? 'text-champagne-700 border-b-2 border-champagne-500 bg-champagne-50/50'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'expenses' ? (
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="text-center py-10 text-stone-400">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-hebrew">עדיין אין הוצאות</p>
                    <button onClick={() => setShowExpenseModal(true)} className="btn-primary text-sm mt-3">
                      <Plus className="w-4 h-4" />הוסף הוצאה ראשונה
                    </button>
                  </div>
                ) : expenses.map(exp => {
                  const remaining = exp.total_amount - (exp.advance_paid || 0) - (exp.paid_amount || 0)
                  return (
                    <div key={exp.id} className={`rounded-xl p-4 border transition-colors ${
                      exp.status === 'paid' ? 'bg-sage-50/50 border-sage-200' :
                      exp.status === 'partial' ? 'bg-amber-50/50 border-amber-200' :
                      'bg-white border-stone-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl mt-0.5 shrink-0">{getCategoryIcon(exp.category_id)}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-dark-brown font-hebrew">{exp.description}</p>
                            <p className="text-xs text-stone-400 font-hebrew">{getCategoryName(exp.category_id)}</p>
                            {exp.due_date && (
                              <p className="text-xs text-stone-400 font-hebrew mt-1">
                                📅 לתשלום: {new Date(exp.due_date).toLocaleDateString('he-IL')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <p className="font-bold text-dark-brown text-lg">₪{exp.total_amount.toLocaleString()}</p>
                          <div className="text-xs space-y-0.5">
                            {exp.advance_paid > 0 && <p className="text-amber-600 font-hebrew">מקדמה: ₪{exp.advance_paid.toLocaleString()}</p>}
                            {exp.paid_amount > 0 && <p className="text-sage-600 font-hebrew">שולם: ₪{exp.paid_amount.toLocaleString()}</p>}
                            <p className={`font-bold font-hebrew ${remaining > 0 ? 'text-red-600' : 'text-sage-600'}`}>
                              {remaining > 0 ? `נשאר: ₪${remaining.toLocaleString()}` : '✅ שולם'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setEditExpense(exp); setShowExpenseModal(true) }} className="p-1.5 rounded-lg hover:bg-white text-stone-400 hover:text-champagne-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={async () => { if (confirm('למחוק?')) { await supabase.from('expenses').delete().eq('id', exp.id); loadData() } }} className="p-1.5 rounded-lg hover:bg-white text-stone-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {incomes.length === 0 ? (
                  <div className="text-center py-10 text-stone-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-hebrew">עדיין אין הכנסות רשומות</p>
                    <button onClick={() => setShowIncomeModal(true)} className="btn-primary text-sm mt-3">
                      <Plus className="w-4 h-4" />הוסף הכנסה
                    </button>
                  </div>
                ) : incomes.map(inc => (
                  <div key={inc.id} className="rounded-xl p-4 border bg-sage-50/50 border-sage-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💰</span>
                      <div>
                        <p className="font-bold text-dark-brown font-hebrew">{inc.source}</p>
                        <p className="text-xs text-stone-400 font-hebrew">
                          {new Date(inc.received_at).toLocaleDateString('he-IL')}
                          {inc.notes && ` • ${inc.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sage-700 text-lg">+₪{inc.amount.toLocaleString()}</p>
                      <button onClick={() => { setEditIncome(inc); setShowIncomeModal(true) }} className="p-1.5 rounded-lg hover:bg-white text-stone-400 hover:text-champagne-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={async () => { if (confirm('למחוק?')) { await supabase.from('incomes').delete().eq('id', inc.id); loadData() } }} className="p-1.5 rounded-lg hover:bg-white text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

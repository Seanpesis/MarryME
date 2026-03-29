'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Search, Filter, Upload, Download, Trash2, Edit2,
  Users, CheckCircle2, Clock, XCircle, Phone, ChevronDown,
  Loader2, X, Check, AlertCircle, UserPlus, Table2
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import Papa from 'papaparse'
import type { Guest } from '@/types'

const STATUS_CONFIG = {
  confirmed: { label: 'אישר הגעה', color: 'badge-confirmed', icon: '✅' },
  pending:   { label: 'ממתין',      color: 'badge-pending',   icon: '⏳' },
  declined:  { label: 'לא מגיע',   color: 'badge-declined',  icon: '❌' },
  maybe:     { label: 'אולי',       color: 'badge-maybe',     icon: '🤔' },
}

const CATEGORY_CONFIG = {
  family:  { label: 'משפחה',       icon: '👨‍👩‍👧' },
  friends: { label: 'חברים',       icon: '👥' },
  work:    { label: 'עבודה',       icon: '💼' },
  other:   { label: 'אחר',         icon: '📋' },
}

function GuestModal({
  guest, eventId, onClose, onSaved
}: {
  guest: Partial<Guest> | null
  eventId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: guest?.name || '',
    phone: guest?.phone || '',
    email: guest?.email || '',
    status: guest?.status || 'pending',
    category: guest?.category || 'other',
    party_size: String(guest?.party_size || 1),
    notes: guest?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      event_id: eventId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      status: form.status as any,
      category: form.category as any,
      party_size: parseInt(form.party_size) || 1,
      confirmed_count: form.status === 'confirmed' ? parseInt(form.party_size) || 1 : 0,
      notes: form.notes,
    }

    const { error } = guest?.id
      ? await supabase.from('guests').update(payload).eq('id', guest.id)
      : await supabase.from('guests').insert(payload)

    if (error) { toast.error('שגיאה בשמירה'); setLoading(false); return }
    toast.success(guest?.id ? 'המוזמן עודכן ✓' : 'המוזמן נוסף ✓')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew text-lg">
            {guest?.id ? 'עריכת מוזמן' : 'הוספת מוזמן'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם מלא *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className="input-field" placeholder="דני כהן" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">טלפון</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" placeholder="050-0000000" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מספר אנשים</label>
              <input type="number" value={form.party_size} onChange={e => update('party_size', e.target.value)} min="1" max="20" className="input-field" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">אימייל</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" placeholder="danny@email.com" dir="ltr" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סטטוס</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="input-field">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קטגוריה</label>
              <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} className="input-field resize-none" rows={2} placeholder="הערות נוספות..." />
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

function ImportModal({ eventId, onClose, onImported }: { eventId: string; onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [imported, setImported] = useState(0)
  const [duplicates, setDuplicates] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = (f: File) => {
    setFile(f)
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const mapped = rows.slice(0, 5).map(row => ({
          name: row['שם'] || row['name'] || row['Name'] || Object.values(row)[0] || '',
          phone: row['טלפון'] || row['phone'] || row['Phone'] || Object.values(row)[1] || '',
          status: 'pending',
        }))
        setPreview(mapped)
        setStep('preview')
      }
    })
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        const { data: existing } = await supabase.from('guests').select('phone').eq('event_id', eventId)
        const existingPhones = new Set(existing?.map(g => g.phone?.replace(/\D/g, '')) || [])

        const toInsert = []
        let dups = 0

        for (const row of rows) {
          const name = row['שם'] || row['name'] || row['Name'] || Object.values(row)[0] || ''
          const phone = String(row['טלפון'] || row['phone'] || row['Phone'] || Object.values(row)[1] || '')
          const cleanPhone = phone.replace(/\D/g, '')

          if (!name) continue
          if (cleanPhone && existingPhones.has(cleanPhone)) { dups++; continue }

          toInsert.push({
            event_id: eventId,
            name: String(name).trim(),
            phone: phone.trim(),
            status: 'pending',
            category: 'other',
            party_size: parseInt(String(row['כמות'] || row['size'] || 1)) || 1,
          })

          if (cleanPhone) existingPhones.add(cleanPhone)
        }

        if (toInsert.length > 0) {
          const { error } = await supabase.from('guests').insert(toInsert)
          if (error) { toast.error('שגיאה בייבוא'); setLoading(false); return }
        }

        setImported(toInsert.length)
        setDuplicates(dups)
        setStep('done')
        setLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-lg">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew text-lg">ייבוא מוזמנים</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Drag drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-champagne-300 rounded-2xl p-10 text-center cursor-pointer hover:bg-champagne-50 transition-colors"
              >
                <Upload className="w-10 h-10 text-champagne-400 mx-auto mb-3" />
                <p className="font-bold font-hebrew text-dark-brown">גרור קובץ לכאן</p>
                <p className="text-stone-400 text-sm font-hebrew mt-1">Excel (.xlsx), CSV, Numbers</p>
                <button className="btn-primary text-sm mt-4">בחר קובץ</button>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {/* Format guide */}
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="font-bold font-hebrew text-sm text-stone-700 mb-2">פורמט מומלץ לקובץ:</p>
                <div className="grid grid-cols-3 gap-2 text-xs font-hebrew text-stone-500">
                  {['שם', 'טלפון', 'כמות'].map(h => (
                    <div key={h} className="bg-white rounded-lg px-2 py-1.5 text-center border border-stone-200 font-bold text-champagne-700">{h}</div>
                  ))}
                  {['דני כהן', '0501234567', '2'].map(v => (
                    <div key={v} className="bg-white rounded-lg px-2 py-1.5 text-center border border-stone-100 text-stone-600">{v}</div>
                  ))}
                </div>
              </div>

              {/* Source options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '📊', label: 'Google Sheets' },
                  { icon: '📱', label: 'אנשי קשר' },
                  { icon: '✏️', label: 'ידנית' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl border border-stone-200 text-center text-xs font-hebrew text-stone-500 opacity-60 cursor-not-allowed">
                    <div className="text-xl mb-1">{s.icon}</div>
                    {s.label}
                    <div className="text-xs text-champagne-500 mt-0.5">בקרוב</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-champagne-50 border border-champagne-200 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 text-champagne-600 shrink-0" />
                <p className="text-sm font-hebrew text-champagne-700">
                  <strong>{file?.name}</strong> — נמצאו שורות לייבוא
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold font-hebrew text-sm text-stone-700">תצוגה מקדימה (5 ראשונים):</p>
                {preview.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl text-sm font-hebrew">
                    <div className="w-7 h-7 rounded-full bg-champagne-100 flex items-center justify-center text-xs font-bold text-champagne-700">{g.name[0]}</div>
                    <span className="font-semibold text-dark-brown">{g.name}</span>
                    {g.phone && <span className="text-stone-400 text-xs dir-ltr">{g.phone}</span>}
                    <span className="badge-pending mr-auto px-2 py-0.5 rounded-full text-xs">ממתין</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="btn-secondary flex-1 justify-center">חזור</button>
                <button onClick={handleImport} disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {loading ? 'מייבא...' : 'ייבא הכל'}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl">🎊</div>
              <h3 className="font-bold font-hebrew text-xl text-dark-brown">הייבוא הושלם!</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm font-hebrew">
                  <span className="text-sage-700">✅ מוזמנים שנוספו</span>
                  <span className="font-bold text-sage-800">{imported}</span>
                </div>
                {duplicates > 0 && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm font-hebrew">
                    <span className="text-amber-700">⚠️ כפילויות שהוסרו</span>
                    <span className="font-bold text-amber-800">{duplicates}</span>
                  </div>
                )}
              </div>
              <button onClick={() => { onImported(); onClose() }} className="btn-primary w-full justify-center">
                <Check className="w-4 h-4" />
                סיום
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [eventId, setEventId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    setEventId(id)
    if (id) loadGuests(id)
  }, [])

  const loadGuests = async (id?: string) => {
    const eid = id || eventId
    if (!eid) return
    setLoading(true)
    const { data } = await supabase.from('guests').select('*').eq('event_id', eid).order('name')
    setGuests(data || [])
    setLoading(false)
  }

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`למחוק ${ids.length} מוזמן/ים?`)) return
    await supabase.from('guests').delete().in('id', ids)
    toast.success('נמחק בהצלחה')
    setSelectedGuests(new Set())
    loadGuests()
  }

  const handleStatusChange = async (guestId: string, status: string) => {
    const guest = guests.find(g => g.id === guestId)
    const confirmedCount = status === 'confirmed' ? (guest?.party_size || 1) : 0
    await supabase.from('guests').update({ status, confirmed_count: confirmedCount }).eq('id', guestId)
    loadGuests()
  }

  const handleExport = () => {
    const data = filtered.map(g => ({
      שם: g.name, טלפון: g.phone, אימייל: g.email,
      סטטוס: STATUS_CONFIG[g.status]?.label,
      קטגוריה: CATEGORY_CONFIG[g.category]?.label,
      'מספר אנשים': g.party_size,
      הערות: g.notes,
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'מוזמנים.csv'; a.click()
    toast.success('הקובץ הורד ✓')
  }

  const toggleSelect = (id: string) => {
    setSelectedGuests(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name.includes(search) || g.phone?.includes(search)
    const matchStatus = filterStatus === 'all' || g.status === filterStatus
    const matchCat = filterCategory === 'all' || g.category === filterCategory
    return matchSearch && matchStatus && matchCat
  })

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
    declined: guests.filter(g => g.status === 'declined').length,
    totalPeople: guests.filter(g => g.status === 'confirmed').reduce((a, g) => a + g.confirmed_count, 0),
  }

  return (
    <>
      {showModal && (
        <GuestModal
          guest={editGuest}
          eventId={eventId}
          onClose={() => { setShowModal(false); setEditGuest(null) }}
          onSaved={() => { setShowModal(false); setEditGuest(null); loadGuests() }}
        />
      )}
      {showImport && (
        <ImportModal
          eventId={eventId}
          onClose={() => setShowImport(false)}
          onImported={loadGuests}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-brown">ניהול מוזמנים</h1>
            <p className="text-stone-500 font-hebrew text-sm mt-1">נהל, עדכן ועקוב אחר כל המוזמנים שלך</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)} className="btn-secondary text-sm py-2">
              <Upload className="w-4 h-4" />
              ייבוא
            </button>
            <button onClick={handleExport} className="btn-secondary text-sm py-2">
              <Download className="w-4 h-4" />
              ייצוא
            </button>
            <button onClick={() => { setEditGuest(null); setShowModal(true) }} className="btn-primary text-sm py-2">
              <UserPlus className="w-4 h-4" />
              הוסף מוזמן
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'סה״כ', value: stats.total, color: 'text-dark-brown', bg: 'bg-stone-50' },
            { label: 'אישרו', value: `${stats.confirmed} (${stats.totalPeople} אנשים)`, color: 'text-sage-700', bg: 'bg-sage-50' },
            { label: 'ממתינים', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'לא מגיעים', value: stats.declined, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-stone-100`}>
              <p className={`font-bold font-display text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם או טלפון..."
              className="input-field pr-10 py-2.5 text-sm"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto py-2.5 text-sm">
            <option value="all">כל הסטטוסים</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field w-auto py-2.5 text-sm">
            <option value="all">כל הקטגוריות</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Bulk actions */}
        {selectedGuests.size > 0 && (
          <div className="flex items-center gap-3 bg-champagne-50 border border-champagne-200 rounded-xl p-3">
            <span className="text-sm font-hebrew text-champagne-700 font-bold">{selectedGuests.size} נבחרו</span>
            <button onClick={() => handleDelete(Array.from(selectedGuests))} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-hebrew">
              <Trash2 className="w-4 h-4" />מחק
            </button>
            <button onClick={() => setSelectedGuests(new Set())} className="mr-auto text-sm text-stone-500 font-hebrew">ביטול</button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-hebrew text-lg font-bold">
              {guests.length === 0 ? 'עדיין אין מוזמנים' : 'לא נמצאו תוצאות'}
            </p>
            {guests.length === 0 && (
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => setShowImport(true)} className="btn-secondary text-sm">
                  <Upload className="w-4 h-4" />ייבוא מקובץ
                </button>
                <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
                  <Plus className="w-4 h-4" />הוסף ידנית
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="p-3 text-right w-8">
                    <input
                      type="checkbox"
                      checked={selectedGuests.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelectedGuests(e.target.checked ? new Set(filtered.map(g => g.id)) : new Set())}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew">שם</th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew hidden sm:table-cell">טלפון</th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew">סטטוס</th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew hidden md:table-cell">קטגוריה</th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew hidden md:table-cell">אנשים</th>
                  <th className="p-3 text-right text-xs font-bold text-stone-500 font-hebrew">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <tr key={g.id} className={`border-b border-stone-50 hover:bg-stone-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-50/30'}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selectedGuests.has(g.id)} onChange={() => toggleSelect(g.id)} className="rounded" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-champagne-200 to-champagne-400 flex items-center justify-center text-xs font-bold text-dark-brown shrink-0">
                          {g.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-brown text-sm font-hebrew">{g.name}</p>
                          {g.notes && <p className="text-xs text-stone-400 truncate max-w-32">{g.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {g.phone ? (
                        <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-sm text-stone-600 hover:text-champagne-600" dir="ltr">
                          <Phone className="w-3 h-3" />
                          {g.phone}
                        </a>
                      ) : <span className="text-stone-300 text-sm">—</span>}
                    </td>
                    <td className="p-3">
                      <select
                        value={g.status}
                        onChange={e => handleStatusChange(g.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border font-hebrew cursor-pointer ${STATUS_CONFIG[g.status]?.color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs text-stone-500 font-hebrew">
                        {CATEGORY_CONFIG[g.category]?.icon} {CATEGORY_CONFIG[g.category]?.label}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-center">
                      <span className="text-sm font-bold text-dark-brown">{g.party_size}</span>
                      {g.status === 'confirmed' && g.confirmed_count > 0 && (
                        <span className="text-xs text-sage-600 block font-hebrew">({g.confirmed_count} אישרו)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditGuest(g); setShowModal(true) }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-champagne-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete([g.id])}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 bg-stone-50 border-t border-stone-100">
              <p className="text-xs text-stone-400 font-hebrew">מציג {filtered.length} מתוך {guests.length} מוזמנים</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

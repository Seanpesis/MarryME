'use client'

import { useState, useEffect } from 'react'
import {
  Search, Star, Phone, Globe, MapPin, Plus, X, Check,
  Loader2, Filter, ExternalLink, DollarSign, Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import type { Vendor } from '@/types'

const CATEGORIES = [
  { id: 'all', label: 'הכל', icon: '🌟' },
  { id: 'צלמים', label: 'צלמים', icon: '📷' },
  { id: 'DJ', label: 'DJ', icon: '🎵' },
  { id: 'אולמות', label: 'אולמות', icon: '🏛️' },
  { id: 'קייטרינג', label: 'קייטרינג', icon: '🍽️' },
  { id: 'עיצוב פרחוני', label: 'פרחים', icon: '💐' },
  { id: 'ספרות וסטיילינג', label: 'סטיילינג', icon: '💄' },
  { id: 'הסעות', label: 'הסעות', icon: '🚗' },
]

function AddToExpenseModal({ vendor, eventId, onClose, onAdded }: any) {
  const [form, setForm] = useState({
    total_amount: '',
    advance_paid: '',
    notes: vendor.description || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Get or create category
    let categoryId = null
    const { data: cats } = await supabase.from('budget_categories').select('id, name').eq('event_id', eventId)
    const matchCat = cats?.find(c => vendor.category.includes(c.name) || c.name.includes(vendor.category.split(' ')[0]))
    categoryId = matchCat?.id || (cats?.[cats.length - 1]?.id || null)

    const remaining = (parseFloat(form.total_amount) || 0) - (parseFloat(form.advance_paid) || 0)
    const status = remaining <= 0 ? 'paid' : parseFloat(form.advance_paid) > 0 ? 'partial' : 'pending'

    const { error } = await supabase.from('expenses').insert({
      event_id: eventId,
      vendor_id: vendor.id,
      category_id: categoryId,
      description: vendor.name,
      total_amount: parseFloat(form.total_amount) || 0,
      advance_paid: parseFloat(form.advance_paid) || 0,
      paid_amount: 0,
      notes: form.notes,
      status,
    })

    if (error) { toast.error('שגיאה בהוספה'); setLoading(false); return }
    toast.success(`${vendor.name} נוסף להוצאות! 💰`)
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-sm">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew">הוסף להוצאות האירוע</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 p-3 bg-champagne-50 rounded-xl mb-5">
            <span className="text-2xl">{CATEGORIES.find(c => c.id === vendor.category)?.icon || '🏢'}</span>
            <div>
              <p className="font-bold text-dark-brown font-hebrew">{vendor.name}</p>
              <p className="text-xs text-stone-500 font-hebrew">{vendor.category} • {vendor.price_range}</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סכום כולל (₪)</label>
              <input
                type="number"
                value={form.total_amount}
                onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                required min="0"
                className="input-field"
                dir="ltr"
                placeholder={vendor.price_range || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מקדמה ששולמה (₪)</label>
              <input
                type="number"
                value={form.advance_paid}
                onChange={e => setForm(f => ({ ...f, advance_paid: e.target.value }))}
                min="0"
                className="input-field"
                dir="ltr"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none" rows={2} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                הוסף להוצאות
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function AddVendorModal({ eventId, onClose, onAdded }: any) {
  const [form, setForm] = useState({
    name: '', category: 'צלמים', phone: '', email: '',
    website: '', description: '', price_range: '', location: '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('vendors').insert({
      ...form,
      user_id: user?.id,
      is_system: false,
      is_recommended: false,
      rating: 0,
      review_count: 0,
    })
    if (error) { toast.error('שגיאה'); setLoading(false); return }
    toast.success('הספק נוסף! ✓')
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew">הוסף ספק חדש</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleAdd} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם הספק *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className="input-field" placeholder="שם העסק" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קטגוריה</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">טלפון</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מיקום</label>
              <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className="input-field" placeholder="תל אביב" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">טווח מחירים</label>
            <input type="text" value={form.price_range} onChange={e => update('price_range', e.target.value)} className="input-field" placeholder="₪5,000-₪15,000" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">תיאור</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} className="input-field resize-none" rows={2} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              הוסף ספק
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VendorCard({ vendor, eventId, onAddExpense }: { vendor: Vendor; eventId: string; onAddExpense: (v: Vendor) => void }) {
  const cat = CATEGORIES.find(c => c.id === vendor.category)

  return (
    <div className="card-hover group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-champagne-100 flex items-center justify-center text-xl">
            {cat?.icon || '🏢'}
          </div>
          <div>
            <h3 className="font-bold text-dark-brown font-hebrew">{vendor.name}</h3>
            <p className="text-xs text-stone-400 font-hebrew">{vendor.category}</p>
          </div>
        </div>
        {vendor.is_recommended && (
          <span className="bg-champagne-100 text-champagne-700 border border-champagne-300 text-xs px-2 py-0.5 rounded-full font-hebrew font-bold shrink-0">
            ⭐ מומלץ
          </span>
        )}
      </div>

      {/* Rating */}
      {(vendor.rating ?? 0) > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(vendor.rating ?? 0) ? 'fill-champagne-400 text-champagne-400' : 'text-stone-200'}`} />
          ))}
          <span className="text-xs text-stone-500 font-hebrew mr-1">{vendor.rating} ({vendor.review_count} ביקורות)</span>
        </div>
      )}

      {/* Description */}
      {vendor.description && (
        <p className="text-sm text-stone-500 font-hebrew leading-relaxed mb-3 flex-1">{vendor.description}</p>
      )}

      {/* Details */}
      <div className="space-y-1 mb-4">
        {vendor.price_range && (
          <div className="flex items-center gap-1.5 text-xs font-hebrew text-stone-500">
            <DollarSign className="w-3.5 h-3.5 text-champagne-500" />
            {vendor.price_range}
          </div>
        )}
        {vendor.location && (
          <div className="flex items-center gap-1.5 text-xs font-hebrew text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-champagne-500" />
            {vendor.location}
          </div>
        )}
        {vendor.phone && (
          <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-xs font-hebrew text-stone-500 hover:text-champagne-600 transition-colors" dir="ltr">
            <Phone className="w-3.5 h-3.5 text-champagne-500" />
            {vendor.phone}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sage-50 border border-sage-200 text-sage-700 text-xs font-hebrew hover:bg-sage-100 transition-colors"
            title="התקשר"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        {vendor.phone && (
          <a
            href={`https://wa.me/972${vendor.phone.replace(/^0/, '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25d366]/10 border border-[#25d366]/30 text-[#128c7e] text-xs font-hebrew hover:bg-[#25d366]/20 transition-colors"
          >
            <MessageCircleIcon className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
        {eventId && (
          <button
            onClick={() => onAddExpense(vendor)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-champagne-50 border border-champagne-200 text-champagne-700 text-xs font-hebrew hover:bg-champagne-100 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            להוצאות
          </button>
        )}
      </div>
    </div>
  )
}

// Simple WA icon
const MessageCircleIcon = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.527 5.836L0 24l6.336-1.503A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.952 9.952 0 01-5.084-1.387l-.364-.218-3.768.894.906-3.676-.237-.378A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
)

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showRecommended, setShowRecommended] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [eventId, setEventId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    setEventId(id)
    loadVendors()
  }, [])

  const loadVendors = async () => {
    setLoading(true)
    const { data } = await supabase.from('vendors').select('*').order('is_recommended', { ascending: false }).order('rating', { ascending: false })
    setVendors(data || [])
    setLoading(false)
  }

  const filtered = vendors.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.description?.includes(search)
    const matchCat = activeCategory === 'all' || v.category === activeCategory
    const matchRec = !showRecommended || v.is_recommended
    return matchSearch && matchCat && matchRec
  })

  return (
    <>
      {selectedVendor && eventId && (
        <AddToExpenseModal
          vendor={selectedVendor}
          eventId={eventId}
          onClose={() => setSelectedVendor(null)}
          onAdded={() => {}}
        />
      )}
      {showAddVendor && (
        <AddVendorModal
          eventId={eventId}
          onClose={() => setShowAddVendor(false)}
          onAdded={() => { setShowAddVendor(false); loadVendors() }}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-brown">מדריך ספקים</h1>
            <p className="text-stone-500 font-hebrew text-sm mt-1">מצא ספקים מומלצים לאירוע שלך והוסף אותם להוצאות</p>
          </div>
          <button onClick={() => setShowAddVendor(true)} className="btn-primary text-sm py-2">
            <Plus className="w-4 h-4" />
            הוסף ספק
          </button>
        </div>

        {/* Search + filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש ספק..."
                className="input-field pr-10 py-2.5 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-colors text-sm font-hebrew font-semibold bg-white hover:border-champagne-300 border-stone-200">
              <input type="checkbox" checked={showRecommended} onChange={e => setShowRecommended(e.target.checked)} className="rounded accent-champagne-500" />
              <Star className="w-4 h-4 text-champagne-500" />
              מומלצים בלבד
            </label>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-hebrew font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-champagne-500 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-champagne-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                <span className="text-xs opacity-70">
                  ({vendors.filter(v => cat.id === 'all' ? true : v.category === cat.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-champagne-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-hebrew text-lg">לא נמצאו ספקים</p>
            <button onClick={() => setShowAddVendor(true)} className="btn-primary text-sm mt-4">
              <Plus className="w-4 h-4" />הוסף ספק ראשון
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-400 font-hebrew">{filtered.length} ספקים נמצאו</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(v => (
                <VendorCard key={v.id} vendor={v} eventId={eventId} onAddExpense={setSelectedVendor} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

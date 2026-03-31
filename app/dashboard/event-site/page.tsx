'use client'

import { useState, useEffect } from 'react'
import { Globe, Copy, ExternalLink, Edit2, Check, MapPin, Gift, Heart, MessageSquare, Calendar, Loader2, Save, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { ISRAEL_VENUES, VENUE_REGIONS, type Venue } from '@/lib/venues'

export default function EventSitePage() {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bride_name: '', groom_name: '', date: '', venue: '',
    venue_address: '', bit_link: '', paybox_link: '',
    cover_message: 'אנו שמחים להזמינכם לחגוג עמנו את יום חתונתנו המיוחד!',
  })
  const [copied, setCopied] = useState(false)
  const [appUrl, setAppUrl] = useState('')
  const [showVenuePicker, setShowVenuePicker] = useState(false)
  const [venueSearch, setVenueSearch] = useState('')
  const [venueRegion, setVenueRegion] = useState('הכל')
  const [selectedVenueInfo, setSelectedVenueInfo] = useState<Venue | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setAppUrl(window.location.origin)
  }, [])

  const filteredVenues = ISRAEL_VENUES.filter(v => {
    const matchRegion = venueRegion === 'הכל' || v.region === venueRegion
    const matchSearch = !venueSearch || v.name.includes(venueSearch) || v.city.includes(venueSearch)
    return matchRegion && matchSearch
  })

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenueInfo(venue)
    setForm(f => ({ ...f, venue: venue.name, venue_address: venue.address }))
    setShowVenuePicker(false)
    setVenueSearch('')
  }

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    if (id) loadEvent(id)
  }, [])

  const loadEvent = async (id: string) => {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').eq('id', id).single()
    if (data) {
      setEvent(data)
      setForm({
        bride_name: data.bride_name || '',
        groom_name: data.groom_name || '',
        date: data.date || '',
        venue: data.venue || '',
        venue_address: data.venue_address || '',
        bit_link: data.bit_link || '',
        paybox_link: data.paybox_link || '',
        cover_message: data.cover_message || 'אנו שמחים להזמינכם לחגוג עמנו את יום חתונתנו המיוחד!',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!event) return
    setSaving(true)
    const { error } = await supabase.from('events').update(form).eq('id', event.id)
    if (error) { toast.error('שגיאה בשמירה'); setSaving(false); return }
    toast.success('האתר עודכן ✓')
    setSaving(false)
    loadEvent(event.id)
  }

  const siteUrl = event && appUrl ? `${appUrl}/event/${event.id.substring(0, 8)}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl)
    setCopied(true)
    toast.success('הקישור הועתק!')
    setTimeout(() => setCopied(false), 2000)
  }

  const wazeUrl = form.venue_address
    ? `https://waze.com/ul?q=${encodeURIComponent(form.venue_address)}`
    : '#'

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-brown">אתר האירוע</h1>
          <p className="text-stone-500 font-hebrew text-sm mt-1">עמוד נחיתה אישי שנשלח לאורחים</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור שינויים
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Edit form */}
        <div className="space-y-5">
          {/* Link */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-champagne-500" />
              <h3 className="font-bold text-dark-brown font-hebrew">קישור האתר שלכם</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-600 font-mono border border-stone-200 overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                {siteUrl}
              </div>
              <button onClick={handleCopy} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-hebrew transition-colors ${copied ? 'bg-sage-500 text-white' : 'btn-secondary'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'הועתק!' : 'העתק'}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="card space-y-4">
            <h3 className="font-bold text-dark-brown font-hebrew">פרטי האירוע</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם הכלה 👰</label>
                <input type="text" value={form.bride_name} onChange={e => setForm(f => ({ ...f, bride_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם החתן 🤵</label>
                <input type="text" value={form.groom_name} onChange={e => setForm(f => ({ ...f, groom_name: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">תאריך</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold font-hebrew text-stone-700">שם המקום</label>
                <button
                  type="button"
                  onClick={() => setShowVenuePicker(v => !v)}
                  className="text-xs text-champagne-600 font-hebrew font-semibold hover:underline flex items-center gap-1"
                >
                  🗺️ בחר מרשימת אולמות
                  <ChevronDown className={`w-3 h-3 transition-transform ${showVenuePicker ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showVenuePicker && (
                <div className="mb-3 border border-champagne-200 rounded-2xl overflow-hidden bg-white shadow-card">
                  <div className="p-3 border-b border-champagne-100 space-y-2">
                    <input
                      type="text" value={venueSearch} onChange={e => setVenueSearch(e.target.value)}
                      placeholder="חפש אולם..." className="input-field py-2 text-sm" autoFocus
                    />
                    <div className="flex gap-1 flex-wrap">
                      {['הכל', ...VENUE_REGIONS].map(r => (
                        <button key={r} type="button" onClick={() => setVenueRegion(r)}
                          className={`text-xs px-2 py-0.5 rounded-full font-hebrew font-semibold transition-colors ${
                            venueRegion === r ? 'bg-champagne-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-champagne-100'
                          }`}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {filteredVenues.map(v => (
                      <button key={v.id} type="button" onClick={() => handleSelectVenue(v)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-champagne-50 text-right border-b border-stone-50 last:border-0 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark-brown font-hebrew text-sm">{v.name}</p>
                          <p className="text-xs text-stone-500 font-hebrew">{v.city} · {v.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="input-field" placeholder="אולם הגן הסגור" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">
                <MapPin className="w-4 h-4 inline ml-1" />
                כתובת לניווט Waze
              </label>
              <input type="text" value={form.venue_address} onChange={e => setForm(f => ({ ...f, venue_address: e.target.value }))} className="input-field" placeholder="רחוב הורד 12, כפר סבא" />
            </div>
            {selectedVenueInfo && (
              <div className="bg-champagne-50 border border-champagne-200 rounded-xl p-3 text-sm font-hebrew flex items-center gap-2 text-champagne-800">
                <span>📞</span>
                <span className="font-semibold">{selectedVenueInfo.name}</span>
                <span>·</span>
                <span dir="ltr">{selectedVenueInfo.phone}</span>
                <span className="text-xs text-champagne-600">· {selectedVenueInfo.capacity} אורחים</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הודעת ברוכים הבאים</label>
              <textarea value={form.cover_message} onChange={e => setForm(f => ({ ...f, cover_message: e.target.value }))} className="input-field resize-none" rows={2} />
            </div>
          </div>

          {/* Payment links */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-champagne-500" />
              <h3 className="font-bold text-dark-brown font-hebrew">קישורי מתנות</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קישור Bit 💳</label>
              <input type="url" value={form.bit_link} onChange={e => setForm(f => ({ ...f, bit_link: e.target.value }))} className="input-field" placeholder="https://bit.digital/..." dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קישור PayBox 💳</label>
              <input type="url" value={form.paybox_link} onChange={e => setForm(f => ({ ...f, paybox_link: e.target.value }))} className="input-field" placeholder="https://paybox.co.il/..." dir="ltr" />
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="sticky top-20">
          <div className="card p-0 overflow-hidden shadow-luxury">
            {/* Preview header */}
            <div className="bg-stone-100 px-4 py-2 flex items-center gap-2 border-b border-stone-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-0.5 text-xs text-stone-400 font-mono text-center">
                {siteUrl}
              </div>
            </div>

            {/* Event page preview */}
            <div className="bg-gradient-to-br from-champagne-50 via-white to-blush-50 min-h-96">
              {/* Hero */}
              <div className="relative py-12 px-6 text-center overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-8 text-4xl opacity-20" style={{ animation: 'float 5s ease-in-out infinite' }}>🌸</div>
                <div className="absolute bottom-4 left-8 text-3xl opacity-20" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '1s' }}>🌿</div>

                <div className="text-5xl mb-3" style={{ animation: 'float 4s ease-in-out infinite' }}>💍</div>
                {(form.bride_name || form.groom_name) ? (
                  <h2 className="font-display text-3xl font-bold text-dark-brown mb-1">
                    {form.bride_name} & {form.groom_name}
                  </h2>
                ) : (
                  <h2 className="font-display text-3xl font-bold text-stone-300 mb-1">שמות הזוג</h2>
                )}

                {form.cover_message && (
                  <p className="text-stone-500 font-hebrew text-sm max-w-xs mx-auto leading-relaxed mt-2">{form.cover_message}</p>
                )}
              </div>

              {/* Info card */}
              <div className="mx-4 mb-4 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="space-y-2.5">
                  {form.date && (
                    <div className="flex items-center gap-3 text-sm font-hebrew">
                      <div className="w-8 h-8 rounded-xl bg-champagne-100 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-champagne-600" />
                      </div>
                      <span className="text-stone-700">
                        {new Date(form.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' | 19:00'}
                      </span>
                    </div>
                  )}
                  {form.venue && (
                    <div className="flex items-center gap-3 text-sm font-hebrew">
                      <div className="w-8 h-8 rounded-xl bg-champagne-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-champagne-600" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-700">{form.venue}</p>
                        {form.venue_address && <p className="text-stone-400 text-xs">{form.venue_address}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 hover:border-champagne-300 transition-colors text-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#00aff9]/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#00aff9]" />
                  </div>
                  <span className="text-xs font-hebrew text-stone-700 font-bold">ניווט</span>
                  <span className="text-xs text-stone-400">Waze</span>
                </a>

                {(form.bit_link || form.paybox_link) ? (
                  <a
                    href={form.bit_link || form.paybox_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 hover:border-champagne-300 transition-colors text-center"
                  >
                    <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="text-xs font-hebrew text-stone-700 font-bold">מתנות</span>
                    <span className="text-xs text-stone-400">{form.bit_link ? 'Bit' : 'PayBox'}</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-1 p-3 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center opacity-50">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-stone-400" />
                    </div>
                    <span className="text-xs font-hebrew text-stone-400">מתנות</span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 hover:border-champagne-300 transition-colors text-center cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-sage-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-sage-600" />
                  </div>
                  <span className="text-xs font-hebrew text-stone-700 font-bold">ברכות</span>
                  <span className="text-xs text-stone-400">כתוב לנו</span>
                </div>
              </div>

              {/* Branding */}
              <div className="text-center pb-4">
                <p className="text-xs text-stone-300 font-hebrew flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-current text-champagne-300" />
                  נוצר עם MarryME
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 font-hebrew text-center mt-3">
            זוהי תצוגה מקדימה — הדף יהיה זמין לאורחים לאחר שמירה
          </p>
        </div>
      </div>
    </div>
  )
}

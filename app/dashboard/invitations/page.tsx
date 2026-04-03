'use client'

import { useState, useEffect } from 'react'
import {
  MessageCircle, Send, Check, CheckCheck, Clock, X,
  Phone, Filter, RefreshCw, Loader2, ChevronRight, Sparkles,
  AlertTriangle, Users, Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import type { Guest } from '@/types'

const TEMPLATES = [
  {
    id: 't1',
    name: 'קלאסי רומנטי 💍',
    preview: 'שלום {name},\nאנו שמחים להזמינך לחגוג עמנו את יום חתונתנו! 🌹\n\n💒 {event_name}\n📅 {date}\n⏰ {time}\n📍 {venue}\n🗺️ {venue_address}\n\nנשמח מאוד לראותך!\n✅ אשר/י הגעה כאן:\n{rsvp_link}',
    style: 'bg-gradient-to-br from-champagne-50 to-blush-50 border-champagne-200',
  },
  {
    id: 't2',
    name: 'מודרני ☀️',
    preview: 'היי {name} 👋\n\nמזמינים אותך לחתונה שלנו!\n\n✨ {event_name}\n📅 {date} בשעה {time}\n📍 {venue}\n🗺️ {venue_address}\n\n👇 לחץ/י לאישור הגעה:\n{rsvp_link}',
    style: 'bg-gradient-to-br from-sage-50 to-blue-50 border-sage-200',
  },
  {
    id: 't3',
    name: 'פורמלי 👑',
    preview: 'לכבוד {name},\n\nברוב שמחה ועם לב מלא אהבה, אנו מזמינים אותך לשמוח עמנו ביום חתונתנו.\n\n{event_name}\n{date} | {time}\n{venue}\n{venue_address}\n\nלאישור הגעה:\n{rsvp_link}\n\nבכבוד רב ובציפייה לראותך',
    style: 'bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200',
  },
]

// Simulated WhatsApp phone animation
function PhonePreview({ message, eventName }: { message: string; eventName: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => setStep(4), 5000),
      setTimeout(() => setStep(0), 8000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [step === 0])

  const preview = message.replace('{name}', 'דני').replace('{event_name}', eventName || 'חתונת יעל ואורי').replace('{date}', '12.08.2025').replace('{time}', '19:00').replace('{venue}', 'אולם הגן הסגור')

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ animation: 'phoneAppear 0.8s ease-out forwards' }}>
        {/* Phone */}
        <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-stone-800 w-52">
          <div className="bg-[#ece5dd] rounded-[2rem] overflow-hidden" style={{ minHeight: '380px' }}>
            {/* WA header */}
            <div className="bg-[#075e54] pt-6 pb-3 px-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-champagne-300 flex items-center justify-center text-xs font-bold">💍</div>
              <div>
                <p className="text-white text-xs font-bold">הזמנה לחתונה</p>
                <p className="text-green-200 text-xs">אישור הגעה</p>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {/* Sending animation */}
              {step >= 1 && (
                <div className="flex justify-end" style={{ animation: 'messageIn 0.4s ease-out' }}>
                  <div className="wa-bubble-out p-2.5 max-w-44 text-xs shadow-sm">
                    <p className="font-bold text-[#075e54] mb-1 text-xs">💌 הזמנה</p>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line text-xs" style={{ fontSize: '10px' }}>
                      {preview.substring(0, 120)}...
                    </p>
                    <div className="flex gap-1 mt-2">
                      <button className="flex-1 bg-[#25d366] text-white rounded-md py-0.5 text-xs font-bold">✅ אגיע</button>
                      <button className="flex-1 bg-gray-300 text-gray-600 rounded-md py-0.5 text-xs">❌</button>
                    </div>
                    <p className="text-gray-400 text-right mt-1" style={{ fontSize: '9px' }}>
                      15:32 {step >= 2 ? <><Check className="w-2.5 h-2.5 inline text-blue-400" /><Check className="w-2.5 h-2.5 inline text-blue-400" /></> : '✓'}
                    </p>
                  </div>
                </div>
              )}

              {/* Typing */}
              {step === 3 && (
                <div className="flex justify-start">
                  <div className="wa-bubble-in p-2 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Response */}
              {step >= 4 && (
                <>
                  <div className="flex justify-start" style={{ animation: 'messageIn 0.4s ease-out' }}>
                    <div className="wa-bubble-in p-2 max-w-36 shadow-sm text-xs">
                      <p className="text-gray-800">כן אגיע! 🎉<br />2 אנשים</p>
                      <p className="text-gray-400 text-right" style={{ fontSize: '9px' }}>15:35</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-[#e7f8ee] rounded-full px-3 py-1" style={{ fontSize: '9px', color: '#128c7e' }}>
                      ✓ אישר הגעה — המערכת עודכנה
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        {step >= 2 && (
          <div className="absolute -top-2 -right-2 bg-sage-500 text-white rounded-xl px-2 py-1 text-xs font-bold shadow-md"
            style={{ animation: 'messageIn 0.3s ease-out', fontSize: '10px' }}>
            ✅ נקרא
          </div>
        )}
      </div>
    </div>
  )
}

export default function InvitationsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id)
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<'all' | 'not_sent' | 'no_response'>('all')
  const [customMessage, setCustomMessage] = useState('')
  const [activeStep, setActiveStep] = useState(1)
  const [sendProgress, setSendProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    if (id) loadData(id)
  }, [])

  const loadData = async (id: string) => {
    setLoading(true)
    const [{ data: ev }, { data: gs }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('guests').select('*').eq('event_id', id).order('name'),
    ])
    setEvent(ev)
    setGuests(gs || [])
    setLoading(false)
  }

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!

  const filteredGuests = guests.filter(g => {
    if (filterType === 'not_sent') return !g.invitation_sent
    if (filterType === 'no_response') return g.invitation_sent && g.status === 'pending'
    return true
  }).filter(g => g.phone) // only guests with phone

  const handleSelectAll = (checked: boolean) => {
    setSelectedGuests(checked ? new Set(filteredGuests.map(g => g.id)) : new Set())
  }

  const handleSend = async () => {
    if (selectedGuests.size === 0) { toast.error('בחר מוזמנים לשליחה'); return }
    if (!event) return

    setSending(true)
    setSendProgress(0)

    const selected = guests.filter(g => selectedGuests.has(g.id))
    let successCount = 0
    let failCount = 0
    for (let i = 0; i < selected.length; i++) {
      const guest = selected[i]

      // Guest-specific RSVP link so the system knows who responded
      const rsvpLink = `${window.location.origin}/event/${event.id}?guest=${guest.id}`

      // Build personalized message
      const msg = (customMessage || template.preview)
        .replace(/{name}/g, guest.name)
        .replace(/{event_name}/g, event.name || '')
        .replace(/{date}/g, event.date ? new Date(event.date).toLocaleDateString('he-IL') : '')
        .replace(/{time}/g, '19:00')
        .replace(/{venue}/g, event.venue || '')
        .replace(/{venue_address}/g, event.venue_address || event.venue || '')
        .replace(/{rsvp_link}/g, rsvpLink)

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: guest.id,
            phone: guest.phone,
            message: msg,
            eventId: event.id,
          }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          successCount++
        } else {
          failCount++
          console.error(`Failed for ${guest.name}:`, data.error)
        }
      } catch (err) {
        failCount++
        console.error(`Error sending to ${guest.name}:`, err)
      }

      setSendProgress(Math.round(((i + 1) / selected.length) * 100))
    }

    if (failCount === 0) {
      toast.success(`✅ ${successCount} הזמנות נשלחו בהצלחה!`)
    } else if (successCount > 0) {
      toast.success(`✅ ${successCount} נשלחו, ⚠️ ${failCount} נכשלו`)
    } else {
      toast.error(`שליחה נכשלה (${failCount} שגיאות). בדוק הגדרות Green API.`)
    }

    setSending(false)
    setSelectedGuests(new Set())
    const id = localStorage.getItem('activeEventId') || ''
    if (id) loadData(id)
  }

  const stats = {
    total: guests.filter(g => g.phone).length,
    sent: guests.filter(g => g.invitation_sent).length,
    read: guests.filter(g => g.whatsapp_status === 'read').length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.invitation_sent && g.status === 'pending').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-brown">הזמנות WhatsApp</h1>
        <p className="text-stone-500 font-hebrew text-sm mt-1">שלח הזמנות אישיות וקבל אישורי הגעה אוטומטיים</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'עם טלפון', value: stats.total, icon: '📱', color: 'bg-stone-50' },
          { label: 'נשלח', value: stats.sent, icon: '✅', color: 'bg-sage-50' },
          { label: 'אישרו', value: stats.confirmed, icon: '🎉', color: 'bg-champagne-50' },
          { label: 'ממתינים', value: stats.pending, icon: '⏳', color: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center border border-stone-100`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <p className="text-xl font-bold font-display text-dark-brown">{s.value}</p>
            <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Steps */}
        <div className="space-y-4">
          {/* Step 1: Template */}
          <div className={`card ${activeStep >= 1 ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 1 ? 'bg-champagne-500 text-white' : 'bg-stone-200 text-stone-500'}`}>1</div>
              <h3 className="font-bold text-dark-brown font-hebrew">בחר תבנית הזמנה</h3>
            </div>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <label key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedTemplate === t.id ? 'border-champagne-400 bg-champagne-50' : 'border-stone-200 hover:border-champagne-200'}`}>
                  <input type="radio" name="template" value={t.id} checked={selectedTemplate === t.id} onChange={() => setSelectedTemplate(t.id)} className="mt-1 accent-champagne-500" />
                  <div>
                    <p className="font-bold font-hebrew text-sm text-dark-brown">{t.name}</p>
                    <p className="text-xs text-stone-500 font-hebrew mt-0.5 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      {Array.from(t.preview).slice(0, 80).join('')}...
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: Customize */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-champagne-500 text-white flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-bold text-dark-brown font-hebrew">התאמה אישית (אופציונלי)</h3>
            </div>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="input-field resize-none text-sm"
              rows={4}
              placeholder={`השתמש ב-{name} לשם המוזמן\n{event_name} לשם האירוע\n{date} לתאריך\n{venue} למקום`}
            />
            <p className="text-xs text-stone-400 font-hebrew mt-2">
              השאר ריק לשימוש בתבנית שנבחרה. משתנים: {'{name}'}, {'{event_name}'}, {'{date}'}, {'{time}'}, {'{venue}'}, {'{rsvp_link}'}
            </p>
          </div>

          {/* Step 3: Select guests */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-champagne-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="font-bold text-dark-brown font-hebrew">בחר מוזמנים לשליחה</h3>
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="input-field w-auto py-1.5 text-xs">
                <option value="all">כולם ({guests.filter(g => g.phone).length})</option>
                <option value="not_sent">לא נשלח ({guests.filter(g => !g.invitation_sent && g.phone).length})</option>
                <option value="no_response">ממתינים ({guests.filter(g => g.invitation_sent && g.status === 'pending').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                onChange={e => handleSelectAll(e.target.checked)}
                className="rounded accent-champagne-500"
              />
              <span className="text-sm font-hebrew text-stone-600">
                בחר הכל ({filteredGuests.length})
                {selectedGuests.size > 0 && ` — ${selectedGuests.size} נבחרו`}
              </span>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-champagne-500" /></div>
              ) : filteredGuests.length === 0 ? (
                <p className="text-center text-stone-400 text-sm font-hebrew py-6">
                  {filterType === 'not_sent' ? 'כל המוזמנים קיבלו הזמנה ✓' : 'אין מוזמנים בפילטר זה'}
                </p>
              ) : filteredGuests.map(g => (
                <label key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedGuests.has(g.id)}
                    onChange={() => setSelectedGuests(prev => { const n = new Set(prev); n.has(g.id) ? n.delete(g.id) : n.add(g.id); return n })}
                    className="rounded accent-champagne-500"
                  />
                  <div className="w-7 h-7 rounded-full bg-champagne-100 flex items-center justify-center text-xs font-bold text-champagne-700 shrink-0">
                    {g.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-hebrew font-semibold text-dark-brown truncate">{g.name}</p>
                    <p className="text-xs text-stone-400" dir="ltr">{g.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {g.invitation_sent && (
                      <span className="text-xs bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded-full font-hebrew border border-sage-200">
                        נשלח
                      </span>
                    )}
                    {g.status === 'confirmed' && <span className="text-xs">✅</span>}
                  </div>
                </label>
              ))}
            </div>

            {/* Send button */}
            <div className="mt-4">
              {sending ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-hebrew text-stone-600">
                    <span>שולח... {sendProgress}%</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="progress-bar h-2">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all" style={{ width: `${sendProgress}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={selectedGuests.size === 0}
                  className="btn-primary w-full justify-center py-3.5 bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#20bd5a] hover:to-[#0e7a5c]"
                >
                  <MessageCircle className="w-5 h-5" />
                  שלח {selectedGuests.size > 0 ? `${selectedGuests.size} ` : ''}הזמנות WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview + Status */}
        <div className="space-y-4">
          {/* Phone preview */}
          <div className="card">
            <h3 className="font-bold text-dark-brown font-hebrew mb-4">תצוגה מקדימה — כך ייראה בוואטסאפ</h3>
            <PhonePreview
              message={customMessage || template.preview}
              eventName={event?.name || 'חתונת יעל ואורי'}
            />
          </div>

          {/* Message preview text */}
          <div className="card">
            <h3 className="font-bold text-dark-brown font-hebrew mb-3">טקסט ההזמנה</h3>
            <div className="bg-[#ece5dd] rounded-xl p-4 text-sm font-hebrew text-gray-800 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
              {(customMessage || template.preview)
                .replace(/{name}/g, 'דני כהן')
                .replace(/{event_name}/g, event?.name || 'חתונת יעל ואורי')
                .replace(/{date}/g, event?.date ? new Date(event.date).toLocaleDateString('he-IL') : '12.08.2025')
                .replace(/{time}/g, '19:00')
                .replace(/{venue}/g, event?.venue || 'אולם הגן הסגור')
                .replace(/{rsvp_link}/g, event ? `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${event.id.substring(0, 8)}` : 'https://marryme.app/e/xxxxxxxx')}
            </div>
          </div>

          {/* Status tracking */}
          <div className="card">
            <h3 className="font-bold text-dark-brown font-hebrew mb-4">מעקב סטטוס הודעות</h3>
            <div className="space-y-2">
              {[
                { label: 'נשלח', count: stats.sent, icon: <Check className="w-4 h-4" />, color: 'text-stone-500 bg-stone-100' },
                { label: 'נקרא', count: stats.read, icon: <CheckCheck className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
                { label: 'אישרו הגעה', count: stats.confirmed, icon: <span>✅</span>, color: 'text-sage-600 bg-sage-50' },
                { label: 'לא ענו', count: stats.pending, icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-2 rounded-lg">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-sm ${s.color}`}>
                    {s.icon}
                    <span className="font-hebrew">{s.label}</span>
                  </div>
                  <span className="font-bold text-dark-brown text-lg">{s.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-sage-50 border border-sage-200 rounded-xl">
              <div className="flex items-start gap-2 text-sm font-hebrew text-sage-700">
                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Green API מחובר</p>
                  <p className="text-xs mt-1 text-sage-600">
                    הודעות נשלחות דרך Green API לוואטסאפ האמיתי של המוזמנים.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Gift, MessageSquare, Calendar, Heart, Check, Send, Loader2, Plus, Minus } from 'lucide-react'

interface Props {
  event: {
    id: string
    name: string
    bride_name: string
    groom_name: string
    date: string
    venue: string
    venue_address: string
    cover_message?: string
    bit_link?: string
    paybox_link?: string
  }
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#dc9229', '#548150', '#e85555', '#faf8f5', '#4A7C59', '#e4aa4e'][i % 6],
            animation: `confettiFall ${2 + Math.random() * 3}s ease-in ${Math.random() * 2}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default function PublicEventClient({ event }: Props) {
  const searchParams = useSearchParams()
  const guestId = searchParams.get('guest')

  const [guestName, setGuestName] = useState('')
  const [guestPartySize, setGuestPartySize] = useState(1)
  const [blessingText, setBlessingText] = useState('')
  const [blessingName, setBlessingName] = useState('')
  const [blessingSent, setBlessingSent] = useState(false)
  const [blessingLoading, setBlessingLoading] = useState(false)
  const [showBlessing, setShowBlessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // RSVP state
  const [rsvpStep, setRsvpStep] = useState<'ask' | 'count' | 'done'>('ask')
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined' | null>(null)
  const [rsvpCount, setRsvpCount] = useState(1)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  // Load guest info if guestId provided
  useEffect(() => {
    if (!guestId) return
    fetch(`/api/rsvp?guest=${guestId}`)
      .then(r => r.json())
      .then(({ guest }) => {
        if (guest) {
          setGuestName(guest.name)
          setGuestPartySize(guest.party_size || 1)
          setRsvpCount(guest.party_size || 1)
          // If already responded, show done state
          if (guest.status === 'confirmed') {
            setRsvpStatus('confirmed')
            setRsvpStep('done')
          } else if (guest.status === 'declined') {
            setRsvpStatus('declined')
            setRsvpStep('done')
          }
        }
      })
      .catch(() => {})
  }, [guestId])

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const wazeUrl = event.venue_address
    ? `https://waze.com/ul?q=${encodeURIComponent(event.venue_address)}`
    : `https://waze.com/ul?q=${encodeURIComponent(event.venue || '')}`

  const handleRsvpYes = () => {
    setRsvpStep('count')
  }

  const handleRsvpNo = async () => {
    setRsvpLoading(true)
    if (guestId) {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, status: 'declined', count: 0 }),
      })
    }
    setRsvpStatus('declined')
    setRsvpStep('done')
    setRsvpLoading(false)
  }

  const handleConfirmCount = async () => {
    setRsvpLoading(true)
    if (guestId) {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, status: 'confirmed', count: rsvpCount }),
      })
    }
    setRsvpStatus('confirmed')
    setRsvpStep('done')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
    setRsvpLoading(false)
  }

  const handleSendBlessing = async () => {
    if (!blessingText.trim()) return
    setBlessingLoading(true)
    try {
      await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: blessingName || guestName || 'אורח',
          message: blessingText,
        }),
      })
    } catch {}
    setBlessingSent(true)
    setBlessingLoading(false)
  }

  return (
    <div className="min-h-screen bg-ivory" dir="rtl">
      {showConfetti && <Confetti />}

      {/* Hero */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-champagne-50 via-white to-blush-50" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-champagne-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blush-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Decorative flowers */}
        <div className="absolute top-8 right-8 text-5xl opacity-20" style={{ animation: 'float 6s ease-in-out infinite' }}>🌸</div>
        <div className="absolute top-20 left-6 text-3xl opacity-15" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '1s' }}>🌿</div>
        <div className="absolute bottom-16 right-6 text-4xl opacity-20" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }}>💐</div>
        <div className="absolute bottom-24 left-8 text-3xl opacity-15" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '0.5s' }}>🕊️</div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-sm mx-auto space-y-8 text-center">
          {/* Ring icon */}
          <div className="text-6xl" style={{ animation: 'float 4s ease-in-out infinite' }}>💍</div>

          {/* Names */}
          <div className="space-y-2">
            {guestName && (
              <p className="text-champagne-600 font-hebrew text-sm font-semibold">שלום {guestName} 👋</p>
            )}
            <p className="text-stone-400 font-hebrew text-sm tracking-widest">אנו שמחים להזמינכם</p>
            <h1 className="font-display text-5xl font-light text-dark-brown leading-tight">
              {event.bride_name && event.groom_name
                ? <>{event.bride_name}<br /><span className="text-3xl text-champagne-500">&</span><br />{event.groom_name}</>
                : event.name}
            </h1>
          </div>

          {/* Cover message */}
          {event.cover_message && (
            <p className="text-stone-500 font-hebrew leading-relaxed text-base max-w-xs mx-auto">
              {event.cover_message}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-champagne-300" />
            <Heart className="w-4 h-4 text-champagne-400 fill-champagne-400" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-champagne-300" />
          </div>

          {/* Event details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-champagne-100 space-y-4 text-right">
            {formattedDate && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-champagne-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-champagne-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-hebrew">תאריך</p>
                  <p className="font-bold text-dark-brown font-hebrew">{formattedDate}</p>
                  <p className="text-stone-500 font-hebrew text-sm">בשעה 19:00</p>
                </div>
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-champagne-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-champagne-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-hebrew">מקום</p>
                  <p className="font-bold text-dark-brown font-hebrew">{event.venue}</p>
                  {event.venue_address && (
                    <p className="text-stone-500 font-hebrew text-sm">{event.venue_address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Waze */}
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card border border-stone-100 hover:border-champagne-300 hover:shadow-card-hover transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00aff9]/10 flex items-center justify-center">
                <span className="text-xl">🗺️</span>
              </div>
              <span className="text-xs font-bold font-hebrew text-stone-700">ניווט</span>
              <span className="text-xs text-stone-400">Waze</span>
            </a>

            {/* Gift */}
            {(event.bit_link || event.paybox_link) ? (
              <a
                href={event.bit_link || event.paybox_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card border border-stone-100 hover:border-champagne-300 hover:shadow-card-hover transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                  <span className="text-xl">💝</span>
                </div>
                <span className="text-xs font-bold font-hebrew text-stone-700">מתנה</span>
                <span className="text-xs text-stone-400">{event.bit_link ? 'Bit' : 'PayBox'}</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 opacity-50">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <span className="text-xl">💝</span>
                </div>
                <span className="text-xs font-bold font-hebrew text-stone-400">מתנה</span>
              </div>
            )}

            {/* Blessing */}
            <button
              onClick={() => setShowBlessing(true)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-card border border-stone-100 hover:border-champagne-300 hover:shadow-card-hover transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center">
                <span className="text-xl">💌</span>
              </div>
              <span className="text-xs font-bold font-hebrew text-stone-700">ברכות</span>
              <span className="text-xs text-stone-400">כתבו לנו</span>
            </button>
          </div>

          {/* ─── RSVP Section ─── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-champagne-100">

            {/* Step 1: Ask yes/no */}
            {rsvpStep === 'ask' && (
              <>
                <p className="font-bold text-dark-brown font-hebrew text-lg mb-4">האם תוכלו להגיע? 🎊</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRsvpYes}
                    disabled={rsvpLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold font-hebrew text-base shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    <Check className="w-5 h-5" />
                    כן, אגיע! 🎉
                  </button>
                  <button
                    onClick={handleRsvpNo}
                    disabled={rsvpLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-100 text-stone-600 font-bold font-hebrew text-base hover:bg-stone-200 active:scale-95 transition-all"
                  >
                    {rsvpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    לא אוכל 😔
                  </button>
                </div>
              </>
            )}

            {/* Step 2: How many people */}
            {rsvpStep === 'count' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-bold text-dark-brown font-hebrew text-lg">כמה אנשים יגיעו?</p>
                  <p className="text-stone-400 font-hebrew text-sm mt-1">כולל אתה/את</p>
                </div>

                {/* Counter */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setRsvpCount(c => Math.max(1, c - 1))}
                    className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <Minus className="w-5 h-5 text-stone-600" />
                  </button>
                  <div className="text-center">
                    <span className="font-display text-5xl font-bold text-dark-brown">{rsvpCount}</span>
                    <p className="text-xs text-stone-400 font-hebrew mt-1">
                      {rsvpCount === 1 ? 'אדם' : 'אנשים'}
                    </p>
                  </div>
                  <button
                    onClick={() => setRsvpCount(c => Math.min(20, c + 1))}
                    className="w-12 h-12 rounded-2xl bg-champagne-100 hover:bg-champagne-200 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <Plus className="w-5 h-5 text-champagne-700" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setRsvpStep('ask')}
                    className="flex-1 py-3 rounded-2xl border-2 border-stone-200 text-stone-600 font-hebrew font-semibold hover:bg-stone-50 transition-colors text-sm"
                  >
                    חזור
                  </button>
                  <button
                    onClick={handleConfirmCount}
                    disabled={rsvpLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold font-hebrew shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    {rsvpLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Check className="w-4 h-4" />
                    }
                    אישור הגעה!
                  </button>
                </div>
              </div>
            )}

            {/* Done: confirmed */}
            {rsvpStep === 'done' && rsvpStatus === 'confirmed' && (
              <div className="text-center space-y-2">
                <div className="text-4xl">🎊</div>
                <p className="font-bold text-sage-700 font-hebrew text-lg">מחכים לראותך!</p>
                <p className="text-stone-500 font-hebrew text-sm">
                  אישרת הגעה עבור {rsvpCount} {rsvpCount === 1 ? 'אדם' : 'אנשים'} 💚
                </p>
                {!guestId && (
                  <p className="text-xs text-stone-400 font-hebrew mt-1">
                    (לעדכון אוטומטי בבסיס הנתונים, פתחו את הקישור האישי שנשלח ב-WhatsApp)
                  </p>
                )}
              </div>
            )}

            {/* Done: declined */}
            {rsvpStep === 'done' && rsvpStatus === 'declined' && (
              <div className="text-center space-y-2">
                <div className="text-4xl">💙</div>
                <p className="font-bold text-stone-700 font-hebrew">חבל שלא תוכל להגיע</p>
                <p className="text-stone-500 font-hebrew text-sm">נשמח לראות אותך בפעם הבאה</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 text-stone-300 text-xs font-hebrew">
            <Heart className="w-3 h-3 fill-champagne-300 text-champagne-300" />
            <span>נוצר עם MarryME</span>
          </div>
        </div>
      </div>

      {/* Blessing Modal */}
      {showBlessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-luxury w-full max-w-sm">
            <div className="p-6">
              {!blessingSent ? (
                <>
                  <div className="text-center mb-5">
                    <div className="text-4xl mb-2">💌</div>
                    <h3 className="font-display text-2xl font-bold text-dark-brown">כתבו לנו ברכה</h3>
                    <p className="text-stone-400 font-hebrew text-sm mt-1">הברכה שלכם תשמח את ליבנו 💕</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שמכם</label>
                      <input
                        type="text"
                        value={blessingName || guestName}
                        onChange={e => setBlessingName(e.target.value)}
                        placeholder="שם מלא"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הברכה שלכם</label>
                      <textarea
                        value={blessingText}
                        onChange={e => setBlessingText(e.target.value)}
                        placeholder="כתבו לנו ברכה חמה מהלב... 💙"
                        className="input-field resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBlessing(false)}
                        className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-hebrew font-semibold hover:bg-stone-50 transition-colors"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleSendBlessing}
                        disabled={!blessingText.trim() || blessingLoading}
                        className="flex-1 btn-primary justify-center py-3"
                      >
                        {blessingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        שלח ברכה
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="text-5xl">🥹</div>
                  <h3 className="font-display text-2xl font-bold text-dark-brown">תודה רבה!</h3>
                  <p className="text-stone-500 font-hebrew">הברכה שלכם הגיעה אלינו 💚<br />נתראה באירוע!</p>
                  <button
                    onClick={() => { setShowBlessing(false); setBlessingSent(false); setBlessingText(''); setBlessingName('') }}
                    className="btn-primary w-full justify-center"
                  >
                    <Check className="w-4 h-4" />
                    סגור
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

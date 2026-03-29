'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Heart, Users, MessageCircle, LayoutGrid, DollarSign, Globe, Star,
  ChevronDown, Check, ArrowLeft, Sparkles, Phone, CheckCheck,
  Upload, Search, BarChart3, Calendar, MapPin, Gift, Menu, X
} from 'lucide-react'

// ============= WHATSAPP DEMO COMPONENT =============
function WhatsAppDemo() {
  const [step, setStep] = useState(0)
  const [showResponse, setShowResponse] = useState(false)
  const [showConfirmed, setShowConfirmed] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timeline = [
      { delay: 800, action: () => setStep(1) },
      { delay: 2200, action: () => setStep(2) },
      { delay: 3500, action: () => setStep(3) },
      { delay: 4800, action: () => { setIsTyping(true) } },
      { delay: 6200, action: () => { setIsTyping(false); setShowResponse(true) } },
      { delay: 7500, action: () => setShowConfirmed(true) },
      { delay: 10000, action: () => {
        setStep(0); setShowResponse(false); setShowConfirmed(false); setIsTyping(false)
      }},
    ]
    const timers = timeline.map(({ delay, action }) => setTimeout(action, delay))
    return () => timers.forEach(clearTimeout)
  }, [showConfirmed]) // reset loop

  return (
    <div className="relative w-full max-w-xs mx-auto" style={{ animation: 'phoneAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
      {/* Phone frame */}
      <div className="relative bg-stone-900 rounded-[3rem] p-3 shadow-2xl border-4 border-stone-800">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-900 rounded-full z-10" />
        
        {/* Screen */}
        <div className="bg-[#ece5dd] rounded-[2.5rem] overflow-hidden" style={{ minHeight: '520px' }}>
          {/* WhatsApp header */}
          <div className="bg-[#075e54] pt-8 pb-3 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champagne-300 flex items-center justify-center text-sm font-bold text-dark-brown">
              יע
            </div>
            <div>
              <p className="text-white font-semibold text-sm">יעל & אורי 💍</p>
              <p className="text-green-200 text-xs">אירוע 12.08.2025</p>
            </div>
          </div>

          {/* Chat area */}
          <div className="p-3 space-y-3 min-h-80 relative">
            {/* Background watermark */}
            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
              <div className="text-8xl">💬</div>
            </div>

            {/* Message 1 - Invitation */}
            {step >= 1 && (
              <div className="flex justify-end" style={{ animation: 'messageIn 0.4s ease-out' }}>
                <div className="wa-bubble-out p-3 max-w-56 text-xs shadow-sm">
                  <p className="font-bold text-[#075e54] text-right mb-1">💌 הזמנה לחתונה</p>
                  <p className="text-right leading-relaxed text-gray-800">
                    שלום דני! 🌹<br/>
                    אנו שמחים להזמינך לחתונתנו
                  </p>
                  <div className="bg-white/60 rounded-lg p-2 mt-2 text-center">
                    <p className="font-bold text-[#075e54]">יעל & אורי</p>
                    <p className="text-gray-600">📅 12.08.2025 | 19:00</p>
                    <p className="text-gray-600">📍 אולם הגן הסגור</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button className="flex-1 bg-[#25d366] text-white rounded-lg py-1 text-xs font-bold">✅ אגיע</button>
                    <button className="flex-1 bg-gray-300 text-gray-700 rounded-lg py-1 text-xs">❌ לא אגיע</button>
                  </div>
                  <p className="text-gray-400 text-right text-xs mt-1">15:32 ✓✓</p>
                </div>
              </div>
            )}

            {/* Message 2 - Link */}
            {step >= 2 && (
              <div className="flex justify-end" style={{ animation: 'messageIn 0.4s ease-out' }}>
                <div className="wa-bubble-out p-2 max-w-48 text-xs shadow-sm">
                  <div className="bg-white rounded-lg p-2 border-r-4 border-[#25d366]">
                    <p className="font-bold text-xs text-gray-700">🌐 אתר האירוע</p>
                    <p className="text-[#075e54] text-xs">simchalink.app/yaelori</p>
                    <p className="text-gray-500 text-xs">ניווט • מתנות • ברכות</p>
                  </div>
                  <p className="text-gray-400 text-right text-xs mt-1">15:32 ✓✓</p>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="wa-bubble-in p-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {/* Guest response */}
            {showResponse && (
              <div className="flex justify-start" style={{ animation: 'messageIn 0.4s ease-out' }}>
                <div className="wa-bubble-in p-3 max-w-48 text-xs shadow-sm">
                  <p className="text-right text-gray-800">כן, אגיע! 🎉<br/>אני ורעייתי, 2 אנשים</p>
                  <p className="text-gray-400 text-right text-xs mt-1">15:35</p>
                </div>
              </div>
            )}

            {/* System confirmation */}
            {showConfirmed && (
              <div className="flex justify-center" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div className="bg-[#e7f8ee] border border-[#25d366]/30 rounded-full px-3 py-1 text-xs text-[#128c7e] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>דני כהן אישר הגעה! המערכת עודכנה 🎊</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      {showConfirmed && (
        <div className="absolute -top-4 -right-4 bg-sage-500 text-white rounded-2xl px-3 py-2 text-xs font-bold shadow-lg"
          style={{ animation: 'messageIn 0.4s ease-out' }}>
          ✅ +2 מאושרים!
        </div>
      )}
    </div>
  )
}

// ============= STATS COUNTER =============
function StatCounter({ value, label, icon }: { value: string, label: string, icon: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const numValue = parseInt(value.replace(/[^0-9]/g, ''))

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const duration = 2000
        const step = numValue / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= numValue) { setCount(numValue); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [numValue])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold gradient-text font-display">
        {count.toLocaleString('he-IL')}+
      </div>
      <p className="text-stone-600 font-hebrew text-sm mt-1">{label}</p>
    </div>
  )
}

// ============= FEATURE CARD =============
function FeatureCard({ icon, title, desc, demo, color }: any) {
  return (
    <div className="card-hover group relative overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${color}`} />
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-dark-brown mb-2">{title}</h3>
      <p className="text-stone-500 font-hebrew text-sm leading-relaxed mb-4">{desc}</p>
      {demo && (
        <div className="bg-stone-50 rounded-xl p-3 text-xs font-hebrew text-stone-600">
          {demo}
        </div>
      )}
    </div>
  )
}

// ============= TESTIMONIAL =============
function Testimonial({ name, role, text, rating }: any) {
  return (
    <div className="card-hover">
      <div className="flex gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-champagne-400 text-champagne-400" />
        ))}
      </div>
      <p className="text-stone-600 font-hebrew text-sm leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne-300 to-champagne-500 flex items-center justify-center text-white font-bold text-sm">
          {name[0]}
        </div>
        <div>
          <p className="font-bold text-dark-brown text-sm">{name}</p>
          <p className="text-stone-400 text-xs">{role}</p>
        </div>
      </div>
    </div>
  )
}

// ============= MAIN LANDING PAGE =============
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-ivory overflow-x-hidden" dir="rtl">
      
      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-champagne-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold text-dark-brown">SimchaLink</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '#features', label: 'תכונות' },
                { href: '#how-it-works', label: 'איך זה עובד' },
                { href: '#pricing', label: 'מחירים' },
                { href: '#testimonials', label: 'המלצות' },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-stone-600 hover:text-champagne-600 font-hebrew text-sm transition-colors">
                  {label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm">
                התחברות
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2">
                <Sparkles className="w-4 h-4" />
                התחל בחינם
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3">
            {[
              { href: '#features', label: 'תכונות' },
              { href: '#how-it-works', label: 'איך זה עובד' },
              { href: '#pricing', label: 'מחירים' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="block font-hebrew text-stone-700 py-2">
                {label}
              </a>
            ))}
            <hr className="border-stone-100" />
            <Link href="/auth/login" className="block font-hebrew text-stone-600 py-2">התחברות</Link>
            <Link href="/auth/register" className="btn-primary w-full justify-center text-sm">
              התחל בחינם
            </Link>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh-1" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-champagne-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-sage-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blush-200/30 rounded-full blur-2xl" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle w-2 h-2 bg-champagne-300/60"
            style={{
              top: `${20 + i * 12}%`,
              right: `${5 + i * 8}%`,
              '--duration': `${5 + i}s`,
              '--delay': `${i * 0.5}s`,
            } as any}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8" style={{ animation: 'slideUp 0.8s ease-out forwards' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-champagne-100/80 border border-champagne-300/50 rounded-full px-4 py-2 text-sm font-hebrew text-champagne-700">
              <Sparkles className="w-4 h-4 text-champagne-500" />
              הפלטפורמה #1 לניהול חתונות בישראל
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-display text-5xl lg:text-7xl font-light text-dark-brown leading-tight">
                האירוע שלכם.
                <br />
                <span className="gradient-text font-bold">השליטה שלכם.</span>
                <br />
                <span className="text-stone-500 text-4xl lg:text-5xl">במקום אחד.</span>
              </h1>
              <p className="text-stone-500 font-hebrew text-lg leading-relaxed max-w-lg">
                ניהול מוזמנים, הזמנות WhatsApp, סידורי הושבה, תקציב, אתר אירוע ומדריך ספקים — 
                <strong className="text-dark-brown"> הכל מתואם, הכל חכם, הכל פשוט.</strong>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth/register" className="btn-primary text-base px-8 py-4 rounded-2xl shadow-luxury" style={{ animation: 'pulseRing 2s infinite' }}>
                <Heart className="w-5 h-5 fill-current" />
                התחל תכנון בחינם
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-6 py-4 rounded-2xl">
                <Phone className="w-4 h-4" />
                ראה הדגמה
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {['ר', 'ד', 'מ', 'ש', 'א'].map((letter, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-champagne-300 to-champagne-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-champagne-400 text-champagne-400" />)}
                </div>
                <p className="text-xs text-stone-500 font-hebrew mt-0.5">2,000+ זוגות השתמשו בנו השנה</p>
              </div>
            </div>
          </div>

          {/* Right - WhatsApp Demo */}
          <div className="flex justify-center lg:justify-end">
            <WhatsAppDemo />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 text-xs font-hebrew" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <span>גלול למטה</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 bg-dark-brown relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,146,41,0.15)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            <StatCounter value="2000" label="אירועים נוהלו" icon="💍" />
            <StatCounter value="500000" label="הודעות נשלחו" icon="💬" />
            <StatCounter value="100000" label="אורחים אישרו הגעה" icon="✅" />
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold gradient-text font-display">4.9/5</div>
              <p className="text-stone-400 font-hebrew text-sm mt-1">דירוג משתמשים</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-light text-dark-brown mb-4">
              הכל מה שצריך
              <span className="gradient-text font-bold"> לאירוע מושלם</span>
            </h2>
            <p className="text-stone-500 font-hebrew text-lg">שישה כלים חזקים, פלטפורמה אחת</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-champagne-400 to-champagne-600"
              title="ניהול מוזמנים חכם"
              desc="ייבוא מ-Google Sheets, Excel, אנשי קשר ווואטסאפ. סינון, חיפוש וסטטיסטיקות בזמן אמת."
              demo={
                <div className="space-y-2">
                  {[
                    { name: 'משפחת כהן', status: 'confirmed', count: '4' },
                    { name: 'חברי צבא', status: 'pending', count: '8' },
                    { name: 'עמיתי עבודה', status: 'maybe', count: '3' },
                  ].map(g => (
                    <div key={g.name} className="flex items-center justify-between bg-white rounded-lg p-2">
                      <span className="font-hebrew text-xs text-stone-700">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-hebrew ${
                          g.status === 'confirmed' ? 'badge-confirmed' : 
                          g.status === 'pending' ? 'badge-pending' : 'badge-maybe'
                        }`}>
                          {g.status === 'confirmed' ? 'אישר' : g.status === 'pending' ? 'ממתין' : 'אולי'}
                        </span>
                        <span className="text-xs text-stone-400">{g.count} 👥</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />

            <FeatureCard
              icon={<MessageCircle className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-[#25d366] to-[#128c7e]"
              title="הזמנות WhatsApp"
              desc="תבניות מעוצבות, שליחה המונית לאלפי מוזמנים. אישור הגעה אוטומטי עם עדכון בזמן אמת."
              demo={
                <div className="bg-[#ece5dd] rounded-xl p-3 text-xs space-y-2">
                  <div className="flex justify-end">
                    <div className="wa-bubble-out p-2 max-w-40">
                      <p>💌 הזמנה לחתונת יעל ואורי</p>
                      <p className="text-gray-400 text-right">✓✓ 15:32</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="wa-bubble-in p-2 max-w-32">
                      <p>כן אגיע! 😊</p>
                      <p className="text-gray-400 text-right">15:35</p>
                    </div>
                  </div>
                </div>
              }
            />

            <FeatureCard
              icon={<LayoutGrid className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-sage-400 to-sage-600"
              title="סידורי הושבה"
              desc="גרירה ושחרור אינטואיטיבית. יצירת שולחנות, שיבוץ לפי קטגוריות, מעקב קיבולת."
              demo={
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { n: '1', occ: 8, cap: 10 }, { n: '2', occ: 10, cap: 10 },
                    { n: '3', occ: 5, cap: 8 }, { n: '4', occ: 4, cap: 10 },
                    { n: '5', occ: 9, cap: 10 }, { n: '6', occ: 7, cap: 8 },
                  ].map(t => (
                    <div key={t.n} className={`rounded-lg p-2 text-center border ${
                      t.occ >= t.cap ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'
                    }`}>
                      <p className="text-xs font-bold text-stone-700">שולחן {t.n}</p>
                      <p className={`text-xs ${t.occ >= t.cap ? 'text-red-500' : 'text-stone-500'}`}>{t.occ}/{t.cap}</p>
                    </div>
                  ))}
                </div>
              }
            />

            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-amber-500 to-orange-600"
              title="ניהול תקציב"
              desc="הגדרת יעד תקציב, ניהול ספקים ותשלומים, מעקב מקדמות, גרפים ויזואליים והכנסות."
              demo={
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-hebrew">
                    <span className="text-stone-500">תקציב כולל</span>
                    <span className="font-bold text-dark-brown">₪120,000</span>
                  </div>
                  {[
                    { name: 'אולם', amount: 45000, color: 'bg-amber-400' },
                    { name: 'צלם', amount: 12000, color: 'bg-orange-400' },
                    { name: 'DJ', amount: 8000, color: 'bg-red-400' },
                  ].map(e => (
                    <div key={e.name}>
                      <div className="flex justify-between text-xs font-hebrew mb-1">
                        <span className="text-stone-600">{e.name}</span>
                        <span className="text-stone-700">₪{e.amount.toLocaleString()}</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`h-full rounded-full ${e.color} transition-all duration-1000`} style={{ width: `${(e.amount/120000)*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
            />

            <FeatureCard
              icon={<Globe className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-blush-400 to-blush-600"
              title="אתר אירוע אישי"
              desc="עמוד נחיתה מעוצב עם ניווט Waze, קישורי Bit/PayBox למתנות, וברכות מהאורחים."
              demo={
                <div className="bg-gradient-to-br from-champagne-100 to-blush-100 rounded-xl p-3 text-center">
                  <p className="font-display text-base font-bold text-dark-brown">יעל & אורי</p>
                  <p className="text-xs text-stone-500 font-hebrew">12.08.2025 • 19:00</p>
                  <div className="flex gap-2 justify-center mt-2">
                    {[{ icon: '📍', label: 'ניווט' }, { icon: '💝', label: 'מתנות' }, { icon: '💌', label: 'ברכות' }].map(b => (
                      <button key={b.label} className="flex flex-col items-center bg-white rounded-lg p-1.5 text-xs shadow-sm flex-1">
                        <span>{b.icon}</span>
                        <span className="font-hebrew text-stone-600">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              }
            />

            <FeatureCard
              icon={<Search className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-violet-500 to-violet-700"
              title="מדריך ספקים"
              desc="חיפוש לפי קטגוריה ואזור, ביקורות מאומתות, ועכשיו ניתן להוסיף ספקים ישירות להוצאות האירוע."
              demo={
                <div className="space-y-2">
                  {[
                    { name: 'סטודיו אור', cat: 'צילום', rating: '4.9', badge: '⭐ מומלץ' },
                    { name: 'DJ מיקי', cat: 'מוזיקה', rating: '4.8', badge: '' },
                  ].map(v => (
                    <div key={v.name} className="flex items-center justify-between bg-white rounded-lg p-2">
                      <div>
                        <p className="text-xs font-bold text-stone-800">{v.name}</p>
                        <p className="text-xs text-stone-400 font-hebrew">{v.cat}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-champagne-600 font-bold">★ {v.rating}</p>
                        {v.badge && <p className="text-xs text-sage-600">{v.badge}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-light text-dark-brown mb-4">
              4 צעדים
              <span className="gradient-text font-bold"> לאירוע מנוהל</span>
            </h2>
            <p className="text-stone-500 font-hebrew">מהרגע שנרשמתם עד לאירוע המושלם</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 right-16 left-16 h-0.5 bg-gradient-to-l from-champagne-200 to-champagne-400" />

            {[
              { step: '1', icon: '🎊', title: 'צרו אירוע', desc: 'הזינו שם, תאריך ומקום. תוך 30 שניות אתם בפנים.' },
              { step: '2', icon: '📋', title: 'העלו מוזמנים', desc: 'ייבוא מ-Excel, Google Sheets, אנשי קשר או ידנית.' },
              { step: '3', icon: '💬', title: 'שלחו הזמנות', desc: 'בחרו תבנית, הוסיפו תמונה ושלחו לכולם בלחיצה.' },
              { step: '4', icon: '📊', title: 'עקבו ותכננו', desc: 'לוח בקרה, סידורי הושבה, תקציב — הכל מוכן.' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-24 h-24 rounded-3xl bg-white shadow-card border-2 border-champagne-200 flex items-center justify-center text-3xl mb-4 group-hover:shadow-card-hover transition-shadow">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-champagne-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-dark-brown font-hebrew mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm font-hebrew leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMPORT SECTION ===== */}
      <section className="py-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-4xl font-light text-dark-brown">
                ייבוא קל
                <span className="gradient-text font-bold"> מכל מקום</span>
              </h2>
              <p className="text-stone-500 font-hebrew text-lg leading-relaxed">
                המערכת מזהה כפילויות ומאחדת רשומות אוטומטית. תוך דקות תהיה לכם רשימת מוזמנים מסודרת ומוכנה.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '📊', title: 'Google Sheets', desc: 'ייבוא ישיר עם קישור לגיליון' },
                  { icon: '📄', title: 'Excel / CSV', desc: 'גרור ושחרר קובץ או בחר מהמחשב' },
                  { icon: '📱', title: 'אנשי קשר בטלפון', desc: 'סנכרון ישיר מהמכשיר' },
                  { icon: '💬', title: 'קבוצות WhatsApp', desc: 'ייבוא מרשימות קיימות' },
                  { icon: '✏️', title: 'הוספה ידנית', desc: 'הכנסה ידנית במהירות' },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-stone-100 hover:border-champagne-200 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="font-bold text-dark-brown text-sm font-hebrew">{item.title}</p>
                      <p className="text-stone-400 text-xs font-hebrew">{item.desc}</p>
                    </div>
                    <Check className="w-4 h-4 text-sage-500 mr-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Import preview card */}
            <div className="card shadow-luxury">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dark-brown font-hebrew">ייבוא מוזמנים</h3>
                <span className="badge-confirmed px-3 py-1 rounded-full text-xs font-hebrew">מוכן</span>
              </div>
              
              <div className="border-2 border-dashed border-champagne-300 rounded-2xl p-8 text-center bg-champagne-50/50 mb-6">
                <Upload className="w-10 h-10 text-champagne-400 mx-auto mb-3" />
                <p className="font-bold text-dark-brown font-hebrew">גרור קובץ לכאן</p>
                <p className="text-stone-400 text-sm font-hebrew mt-1">Excel, CSV, Google Sheets</p>
                <button className="btn-primary text-sm mt-4">
                  <Upload className="w-4 h-4" />
                  בחר קובץ
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-hebrew bg-sage-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sage-600" />
                    <span className="text-sage-700">זוהו 127 מוזמנים</span>
                  </div>
                  <span className="text-stone-400 text-xs">3 כפילויות הוסרו</span>
                </div>
                <div className="flex items-center justify-between text-sm font-hebrew bg-champagne-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-champagne-600" />
                    <span className="text-champagne-700">הייבוא הושלם בהצלחה</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-light text-dark-brown mb-4">
              מה אומרים
              <span className="gradient-text font-bold"> הזוגות שלנו</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              name="רחל ואלעד מזרחי"
              role="נישאו ב-2024 • תל אביב"
              rating={5}
              text="SimchaLink שינתה לנו את חיי הארגון לגמרי. שלחנו הזמנות ל-280 אורחים בלחיצה אחת, וה-dashboard נתן לנו תמונה ברורה בזמן אמת על מי אישר ומי לא."
            />
            <Testimonial
              name="נועה וגל שפירא"
              role="נישאו ב-2025 • ירושלים"
              rating={5}
              text="הניהול התקציבי הציל אותנו. ראינו בזמן אמת כמה נשאר לשלם לכל ספק, מה מקדמות ששילמנו ומה עוד נשאר. ממליצות בחום!"
            />
            <Testimonial
              name="מאיה ויוני לוי"
              role="נישאו ב-2024 • חיפה"
              rating={5}
              text="סידורי ההושבה בגרירה היו קסם. הזזנו שולחנות ואורחים ב-5 דקות, ובסוף האירוע כולם ישבו בדיוק איפה שרצינו. מערכת מדהימה!"
            />
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-dark-brown relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,146,41,0.2)_0%,_transparent_70%)]" />
        
        <div className="relative max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="text-6xl">💍</div>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-white">
            מוכנים לתכנן את
            <span className="gradient-text font-bold"> האירוע שלכם?</span>
          </h2>
          <p className="text-stone-400 font-hebrew text-lg leading-relaxed">
            הצטרפו ל-2,000+ זוגות שכבר משתמשים ב-SimchaLink לתכנון החתונה שלהם.
            <br />
            <strong className="text-champagne-400">חינם לחלוטין למשך 30 יום.</strong>
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg px-10 py-4 rounded-2xl">
              <Heart className="w-5 h-5 fill-current" />
              התחל עכשיו — בחינם
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-stone-600 text-stone-300 hover:border-champagne-400 hover:text-champagne-400 transition-colors font-hebrew">
              יש לי כבר חשבון
            </Link>
          </div>
          <p className="text-stone-500 text-sm font-hebrew">
            ✓ ללא כרטיס אשראי ✓ ללא התחייבות ✓ ביטול בכל עת
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-display text-lg font-bold text-white">SimchaLink</span>
              </div>
              <p className="text-sm font-hebrew leading-relaxed">
                הפלטפורמה החכמה לניהול אירועים בישראל
              </p>
            </div>
            {[
              { title: 'מוצר', links: ['תכונות', 'מחירים', 'API', 'עדכונים'] },
              { title: 'תמיכה', links: ['מרכז עזרה', 'צור קשר', 'מדריכים', 'שאלות נפוצות'] },
              { title: 'חברה', links: ['אודות', 'פרטיות', 'תנאי שימוש', 'קריירה'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-bold font-hebrew mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm font-hebrew hover:text-champagne-400 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-800 pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-hebrew">© 2025 SimchaLink. כל הזכויות שמורות.</p>
            <p className="text-sm font-hebrew">
              נעשה בישראל עם ❤️ לחתונות ישראליות
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

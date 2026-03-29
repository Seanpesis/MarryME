'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, User, Phone, AlertCircle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'לפחות 8 תווים' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'אות גדולה אחת' },
  { test: (p: string) => /[0-9]/.test(p), label: 'ספרה אחת' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }
    if (form.password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'כתובת האימייל הזו כבר רשומה במערכת' : 'שגיאה בהרשמה, נסה שנית')
      setLoading(false)
      return
    }

    if (data.session) {
      toast.success('ברוכים הבאים! 🎊 האירוע שלכם מתחיל כאן')
      router.refresh()
      router.push('/dashboard')
    } else if (data.user) {
      toast.success('נשלח אימייל אישור לכתובתך! אנא אשר את חשבונך ואז התחבר.')
      setLoading(false)
    } else {
      setError('שגיאה בהרשמה, נסה שנית')
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) {
      setError('שגיאה בהרשמה עם Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex" dir="rtl">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-brown">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_rgba(220,146,41,0.2)_0%,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="space-y-3 mb-10">
            {['💒', '💐', '🥂'].map((emoji, i) => (
              <div
                key={i}
                className="text-5xl"
                style={{
                  animation: `float ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
          <h2 className="font-display text-4xl font-light text-white mb-4">
            תתחילו לתכנן
            <br />
            <span className="gradient-text font-bold">את הרגע הגדול</span>
          </h2>
          <p className="text-stone-400 font-hebrew text-base max-w-xs leading-relaxed">
            4 צעדים פשוטים מהרשמה לאירוע מנוהל לגמרי. ללא כרטיס אשראי.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-3 w-full max-w-xs text-right">
            {[
              '✓ צרו אירוע בתוך 30 שניות',
              '✓ ייבאו רשימת אורחים',
              '✓ שלחו הזמנות בוואטסאפ',
              '✓ עקבו ותכננו בזמן אמת',
            ].map((step, i) => (
              <div
                key={i}
                className="glass-card-dark rounded-xl px-4 py-3 text-sm font-hebrew text-stone-300"
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display text-2xl font-bold text-dark-brown">MarryME</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-dark-brown">הרשמה חינם</h1>
            <p className="text-stone-500 font-hebrew mt-2">התחילו לתכנן את האירוע שלכם עכשיו</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all font-hebrew font-semibold text-stone-700 shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            הרשמה עם Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-sm font-hebrew">או עם אימייל</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm font-hebrew text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם מלא</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="יעל ואורי לוי"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">טלפון (לשליחת WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="050-0000000"
                  className="input-field pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="לפחות 8 תווים"
                  required
                  className="input-field pr-10 pl-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-3 flex-wrap">
                  {PASSWORD_RULES.map(rule => (
                    <span key={rule.label} className={`flex items-center gap-1 text-xs font-hebrew ${rule.test(form.password) ? 'text-sage-600' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3" />
                      {rule.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">אימות סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="הכנס שוב את הסיסמה"
                  required
                  className={`input-field pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300' : ''}`}
                />
              </div>
            </div>

            <p className="text-xs text-stone-400 font-hebrew leading-relaxed">
              בהרשמה אתם מסכימים ל
              <a href="#" className="text-champagne-600 hover:underline"> תנאי השימוש</a>
              {' '}ולמדיניות{' '}
              <a href="#" className="text-champagne-600 hover:underline">הפרטיות</a>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-current" />}
              {loading ? 'נרשם...' : 'צור חשבון בחינם'}
            </button>
          </form>

          <p className="text-center text-stone-500 font-hebrew text-sm mt-6">
            כבר יש לך חשבון?{' '}
            <Link href="/auth/login" className="text-champagne-600 font-bold hover:text-champagne-700">
              התחבר
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError('אימייל או סיסמה שגויים. נסה שנית.')
      setLoading(false)
      return
    }
    
    toast.success('ברוך השב! 💍')
    router.push('/dashboard')
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) {
      setError('שגיאה בהתחברות עם Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex" dir="rtl">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-brown">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(220,146,41,0.25)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="text-8xl mb-6" style={{ animation: 'float 4s ease-in-out infinite' }}>💍</div>
          <h2 className="font-display text-5xl font-light text-white mb-4">
            ברוכים השבים
          </h2>
          <p className="text-champagne-300 font-hebrew text-lg max-w-xs leading-relaxed">
            כל הכלים לאירוע המושלם שלכם, ממתינים לכם כאן.
          </p>
          
          {/* Floating cards */}
          <div className="mt-12 space-y-3 w-full max-w-xs">
            {[
              { icon: '✅', text: '2,000+ אירועים נוהלו', color: 'from-sage-600/30 to-sage-700/30' },
              { icon: '💬', text: '500,000+ הזמנות נשלחו', color: 'from-champagne-600/30 to-champagne-700/30' },
              { icon: '⭐', text: 'דירוג 4.9/5 מהמשתמשים', color: 'from-amber-600/30 to-amber-700/30' },
            ].map((item, i) => (
              <div
                key={i}
                className={`glass-card-dark rounded-2xl p-4 flex items-center gap-3`}
                style={{ animation: `slideUp 0.6s ease-out ${i * 0.15}s forwards`, opacity: 0 }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-stone-300 font-hebrew text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display text-2xl font-bold text-dark-brown">SimchaLink</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-dark-brown">התחברות</h1>
            <p className="text-stone-500 font-hebrew mt-2">שמחים לראות אותך שוב!</p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all font-hebrew font-semibold text-stone-700 shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            המשך עם Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-sm font-hebrew">או עם אימייל</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm font-hebrew text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold font-hebrew text-stone-700">
                  סיסמה
                </label>
                <a href="#" className="text-xs text-champagne-600 hover:text-champagne-700 font-hebrew">
                  שכחתי סיסמה
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>
          </form>

          <p className="text-center text-stone-500 font-hebrew text-sm mt-6">
            עדיין אין לך חשבון?{' '}
            <Link href="/auth/register" className="text-champagne-600 font-bold hover:text-champagne-700">
              הרשמה חינם
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

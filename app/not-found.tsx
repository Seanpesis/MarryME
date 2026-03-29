import Link from 'next/link'
import { Heart, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-8" dir="rtl">
      <div className="text-center max-w-md space-y-6">
        <div className="text-8xl" style={{ animation: 'float 4s ease-in-out infinite' }}>💍</div>
        <div>
          <h1 className="font-display text-6xl font-bold text-dark-brown mb-2">404</h1>
          <p className="text-xl font-bold font-hebrew text-stone-700">הדף לא נמצא</p>
          <p className="text-stone-400 font-hebrew mt-2">
            נראה שהכתובת לא נכונה, או שהאירוע לא קיים יותר.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            לדף הבית
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            לדאשבורד
          </Link>
        </div>
      </div>
    </div>
  )
}

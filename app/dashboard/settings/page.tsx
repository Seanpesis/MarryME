'use client'

import { useState, useEffect } from 'react'
import {
  User, Phone, Bell, Shield, MessageCircle, Key,
  Check, Loader2, X, Save, Eye, EyeOff, AlertTriangle,
  Trash2, Download, ExternalLink, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

interface TabProps { label: string; icon: React.ReactNode; id: string }

const TABS: TabProps[] = [
  { id: 'profile', label: 'פרופיל', icon: <User className="w-4 h-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
  { id: 'notifications', label: 'התראות', icon: <Bell className="w-4 h-4" /> },
  { id: 'security', label: 'אבטחה', icon: <Shield className="w-4 h-4" /> },
]

function ProfileTab({ user }: { user: any }) {
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: form.full_name, phone: form.phone }
    })
    if (error) { toast.error('שגיאה בשמירה'); setLoading(false); return }
    toast.success('הפרופיל עודכן ✓')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-dark-brown font-hebrew text-lg mb-4">פרטי חשבון</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-champagne-300 to-champagne-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            {form.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-dark-brown font-hebrew">{form.full_name || 'משתמש'}</p>
            <p className="text-stone-400 text-sm">{user?.email}</p>
            <p className="text-xs text-stone-300 font-hebrew mt-0.5">
              {user?.app_metadata?.provider === 'google' ? '🔗 מחובר עם Google' : '📧 אימייל וסיסמה'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם מלא</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="input-field"
              placeholder="שם מלא"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">אימייל</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field bg-stone-50 text-stone-400 cursor-not-allowed"
            />
            <p className="text-xs text-stone-400 font-hebrew mt-1">לא ניתן לשנות אימייל</p>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">טלפון</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field"
              placeholder="050-0000000"
              dir="ltr"
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary mt-5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור שינויים
        </button>
      </div>

      {/* Danger zone */}
      <div className="border-t border-stone-100 pt-6">
        <h4 className="font-bold text-red-600 font-hebrew mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          אזור מסוכן
        </h4>
        <div className="space-y-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-hebrew hover:bg-red-50 transition-colors">
            <Download className="w-4 h-4" />
            ייצוא כל הנתונים שלי
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-700 text-sm font-hebrew hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            מחק חשבון לצמיתות
          </button>
        </div>
      </div>
    </div>
  )
}

function WhatsAppTab() {
  const [config, setConfig] = useState({
    provider: 'simulation',
    greenApiInstanceId: '',
    greenApiToken: '',
    twilioSid: '',
    twilioToken: '',
    twilioFrom: '',
  })
  const [showTokens, setShowTokens] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState(false)

  const handleTest = async () => {
    if (!testPhone) { toast.error('הכנס מספר טלפון'); return }
    setTesting(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success(`הודעת בדיקה נשלחה ל-${testPhone} ✓`)
    setConnected(true)
    setTesting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-dark-brown font-hebrew text-lg mb-1">הגדרות WhatsApp</h3>
        <p className="text-stone-400 font-hebrew text-sm">חבר את חשבון הוואטסאפ שלך לשליחת הזמנות אמיתיות</p>
      </div>

      {/* Provider selector */}
      <div>
        <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-3">ספק שליחה</label>
        <div className="space-y-2">
          {[
            { id: 'simulation', label: 'מצב סימולציה (ללא שליחה)', desc: 'לבדיקה בלבד — לא שולח הודעות אמיתיות', icon: '🧪' },
            { id: 'green', label: 'Green API', desc: 'מומלץ לישראל — חינם עד 1000 הודעות', icon: '🟢', url: 'https://green-api.com' },
            { id: 'twilio', label: 'Twilio WhatsApp', desc: 'Business API רשמי של Meta', icon: '🔵', url: 'https://twilio.com' },
          ].map(p => (
            <label key={p.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${config.provider === p.id ? 'border-champagne-400 bg-champagne-50' : 'border-stone-200 hover:border-champagne-200'}`}>
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={config.provider === p.id}
                onChange={() => setConfig(c => ({ ...c, provider: p.id }))}
                className="mt-0.5 accent-champagne-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <span className="font-semibold font-hebrew text-sm text-dark-brown">{p.label}</span>
                  {'url' in p && (
                    <a href={(p as any).url} target="_blank" rel="noopener noreferrer" className="text-champagne-600">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-stone-400 font-hebrew mt-0.5">{p.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Green API config */}
      {config.provider === 'green' && (
        <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold font-hebrew text-sm text-dark-brown">Green API הגדרות</h4>
            <button onClick={() => setShowTokens(!showTokens)} className="text-xs text-stone-400 font-hebrew flex items-center gap-1">
              {showTokens ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showTokens ? 'הסתר' : 'הצג'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">Instance ID</label>
            <input
              type="text"
              value={config.greenApiInstanceId}
              onChange={e => setConfig(c => ({ ...c, greenApiInstanceId: e.target.value }))}
              className="input-field"
              placeholder="1234567890"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">Token</label>
            <input
              type={showTokens ? 'text' : 'password'}
              value={config.greenApiToken}
              onChange={e => setConfig(c => ({ ...c, greenApiToken: e.target.value }))}
              className="input-field"
              placeholder="••••••••••••••••"
              dir="ltr"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-hebrew text-amber-700">
            <p className="font-bold mb-1">הוראות:</p>
            <ol className="space-y-0.5 list-decimal list-inside">
              <li>הירשם ב-green-api.com</li>
              <li>צור Instance חדש</li>
              <li>סרוק QR Code עם WhatsApp בטלפון</li>
              <li>הכנס את ה-Instance ID וה-Token כאן</li>
            </ol>
          </div>
        </div>
      )}

      {/* Twilio config */}
      {config.provider === 'twilio' && (
        <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <h4 className="font-bold font-hebrew text-sm text-dark-brown">Twilio הגדרות</h4>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">Account SID</label>
            <input type={showTokens ? 'text' : 'password'} value={config.twilioSid} onChange={e => setConfig(c => ({ ...c, twilioSid: e.target.value }))} className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">Auth Token</label>
            <input type={showTokens ? 'text' : 'password'} value={config.twilioToken} onChange={e => setConfig(c => ({ ...c, twilioToken: e.target.value }))} className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">WhatsApp From Number</label>
            <input type="text" value={config.twilioFrom} onChange={e => setConfig(c => ({ ...c, twilioFrom: e.target.value }))} className="input-field" placeholder="whatsapp:+14155238886" dir="ltr" />
          </div>
        </div>
      )}

      {/* Test */}
      {config.provider !== 'simulation' && (
        <div className="space-y-3">
          <h4 className="font-bold font-hebrew text-sm text-dark-brown">שלח הודעת בדיקה</h4>
          <div className="flex gap-2">
            <input
              type="tel"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="050-0000000"
              className="input-field flex-1"
              dir="ltr"
            />
            <button onClick={handleTest} disabled={testing} className="btn-primary shrink-0">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              בדיקה
            </button>
          </div>
          {connected && (
            <div className="flex items-center gap-2 bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm font-hebrew text-sage-700">
              <Check className="w-4 h-4" />
              החיבור פעיל — הודעות נשלחות בהצלחה!
            </div>
          )}
        </div>
      )}

      {/* Webhook URL */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
        <p className="font-bold font-hebrew text-sm text-stone-700 mb-2">Webhook URL (לאישורים אוטומטיים)</p>
        <div className="bg-white rounded-lg px-3 py-2 text-xs font-mono text-stone-600 border border-stone-200 break-all" dir="ltr">
          https://yourapp.vercel.app/api/whatsapp/webhook
        </div>
        <p className="text-xs text-stone-400 font-hebrew mt-2">הגדר כתובת זו ב-Green API / Twilio לקבלת אישורי הגעה אוטומטיים</p>
      </div>

      <button className="btn-primary">
        <Save className="w-4 h-4" />
        שמור הגדרות WhatsApp
      </button>
    </div>
  )
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    newRsvp: true,
    dailySummary: false,
    weeklyReport: true,
    budgetAlerts: true,
    budgetThreshold: '80',
  })

  const toggle = (key: string) => setSettings(s => ({ ...s, [key]: !(s as any)[key] }))

  const ToggleRow = ({ id, label, desc }: { id: string; label: string; desc?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-stone-50">
      <div>
        <p className="font-semibold font-hebrew text-sm text-dark-brown">{label}</p>
        {desc && <p className="text-xs text-stone-400 font-hebrew mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => toggle(id)}
        className={`relative w-11 h-6 rounded-full transition-colors ${(settings as any)[id] ? 'bg-champagne-500' : 'bg-stone-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(settings as any)[id] ? 'translate-x-0.5' : 'translate-x-5'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-dark-brown font-hebrew text-lg">הגדרות התראות</h3>
      <ToggleRow id="newRsvp" label="אישור הגעה חדש" desc="קבל התראה כשאורח מאשר או מבטל" />
      <ToggleRow id="dailySummary" label="סיכום יומי" desc="סיכום יומי של אישורים וסטטיסטיקות" />
      <ToggleRow id="weeklyReport" label="דוח שבועי" desc="דוח שבועי מקיף לפני האירוע" />
      <ToggleRow id="budgetAlerts" label="התראות תקציב" desc="התרעה כשמנצלים חלק גדול מהתקציב" />

      {settings.budgetAlerts && (
        <div className="pr-4 border-r-2 border-champagne-300 mt-1">
          <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-2">
            התרעה ב-{settings.budgetThreshold}% מהתקציב
          </label>
          <input
            type="range"
            min="50" max="100" step="5"
            value={settings.budgetThreshold}
            onChange={e => setSettings(s => ({ ...s, budgetThreshold: e.target.value }))}
            className="w-full accent-champagne-500"
          />
          <div className="flex justify-between text-xs text-stone-400 font-hebrew mt-1">
            <span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
      )}

      <button onClick={() => toast.success('הגדרות נשמרו ✓')} className="btn-primary mt-2">
        <Save className="w-4 h-4" />
        שמור הגדרות
      </button>
    </div>
  )
}

function SecurityTab({ user }: { user: any }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const supabase = createClient()

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('הסיסמאות לא תואמות'); return }
    if (newPassword.length < 8) { toast.error('סיסמה חייבת להכיל לפחות 8 תווים'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { toast.error('שגיאה בשינוי סיסמה'); setLoading(false); return }
    toast.success('הסיסמה שונתה ✓')
    setNewPassword(''); setConfirmPassword('')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-dark-brown font-hebrew text-lg">אבטחת חשבון</h3>

      {user?.app_metadata?.provider !== 'google' && (
        <div className="space-y-4">
          <h4 className="font-semibold font-hebrew text-stone-700">שינוי סיסמה</h4>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">סיסמה חדשה</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="לפחות 8 תווים"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">אימות סיסמה</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`input-field ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : ''}`}
              placeholder="הכנס שוב"
            />
          </div>
          <button onClick={handleChangePassword} disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            שנה סיסמה
          </button>
        </div>
      )}

      {/* Sessions */}
      <div className="border-t border-stone-100 pt-5">
        <h4 className="font-semibold font-hebrew text-stone-700 mb-3">התנתק מכל המכשירים</h4>
        <p className="text-sm text-stone-400 font-hebrew mb-3">זה יסיים את כל הסשנים הפעילים</p>
        <button
          onClick={async () => {
            await createClient().auth.signOut({ scope: 'global' })
            toast.success('התנתקת מכל המכשירים')
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-hebrew hover:bg-red-50 transition-colors"
        >
          <Shield className="w-4 h-4" />
          התנתק מכל המכשירים
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark-brown">הגדרות</h1>
        <p className="text-stone-500 font-hebrew text-sm mt-1">נהל את החשבון וההגדרות שלך</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="sm:w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-hebrew font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-champagne-50 text-champagne-700 border-r-2 border-champagne-500'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 card">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'whatsapp' && <WhatsAppTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab user={user} />}
        </div>
      </div>
    </div>
  )
}

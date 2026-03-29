# 💍 MarryME — פלטפורמת ניהול חתונות

> **Next.js 14 · Supabase · TypeScript · Tailwind CSS · RTL Hebrew**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Seanpesis/MarryME)

---

## ✨ תכונות עיקריות

| תכונה | תיאור |
|--------|--------|
| 👥 **ניהול מוזמנים** | ייבוא CSV/Excel, CRUD, סינון, ייצוא |
| 💬 **הזמנות WhatsApp** | שליחה המונית, מעקב סטטוס, אישור אוטומטי |
| 🪑 **סידורי הושבה** | Drag & Drop אמיתי עם @hello-pangea/dnd |
| 💰 **ניהול תקציב** | הוצאות + מקדמות + הכנסות + גרפים |
| 🔍 **מדריך ספקים** | ספקים מובנים + הוספה אישית |
| 🌐 **אתר אירוע** | דף נחיתה אישי עם Waze + מתנות |
| 💌 **קיר ברכות** | ברכות מהאורחים בזמן אמת |
| 📊 **דוחות** | ייצוא CSV + הדפסה |
| 🔴 **Real-time** | Supabase Realtime — עדכונים חיים |
| 📱 **PWA** | ניתן להתקין כאפליקציה במובייל |

---

## 🚀 Quick Start

### 1. Clone + Install
```bash
git clone https://github.com/Seanpesis/MarryME.git
cd MarryME
npm install
```

### 2. Supabase Setup

1. פתח [supabase.com](https://supabase.com) → New Project
2. **SQL Editor** → הדבק + הרץ את `supabase-schema.sql`
3. Authentication → Providers → **Google** → Enable (אופציונלי)

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```
ערוך `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## 📱 WhatsApp Integration

### Green API (מומלץ — חינם עד 1000 הודעות/חודש)
1. הירשם ב-[green-api.com](https://green-api.com)
2. צור Instance → סרוק QR עם WhatsApp
3. הוסף ל-`.env.local`:
```env
GREEN_API_INSTANCE_ID=7103xxxxxx
GREEN_API_TOKEN=your_token_here
```
4. הגדר Webhook:
```
https://your-domain.com/api/whatsapp/webhook
```

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add env vars in Vercel Dashboard → Settings → Environment Variables.

Update Supabase → Authentication → URL Configuration:
```
https://your-app.vercel.app/auth/callback
```

---

## 📁 Project Structure

```
MarryME/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Login + Register + OAuth callback
│   ├── dashboard/               # All dashboard pages
│   │   ├── page.tsx             # Overview + real-time stats
│   │   ├── guests/              # Guest management
│   │   ├── invitations/         # WhatsApp invitations
│   │   ├── tables/              # Seating (drag & drop)
│   │   ├── budget/              # Budget tracking
│   │   ├── vendors/             # Vendor directory
│   │   ├── event-site/          # Personal event page
│   │   ├── blessings/           # Guest blessings wall
│   │   ├── reports/             # Reports + CSV export
│   │   └── settings/            # Account + WhatsApp config
│   └── event/[slug]/            # Public event page for guests
├── components/
│   ├── ui/                      # Shared UI components
│   ├── charts/                  # Recharts components
│   └── dashboard/               # RealtimeProvider, MobileNav
├── lib/
│   ├── supabase-client.ts       # Browser client
│   ├── supabase-server.ts       # Server client
│   ├── hooks.ts                 # Custom React hooks
│   └── utils.ts                 # Helper functions
├── types/index.ts               # TypeScript types
├── middleware.ts                 # Auth route protection
└── supabase-schema.sql          # Complete DB schema
```

---

## 🎨 Design System

- **Primary:** Champagne Gold `#dc9229`
- **Success:** Sage Green `#548150`
- **Background:** Ivory `#faf8f5`
- **Font:** Cormorant Garamond + Heebo (Hebrew)

---

*Made with ❤️ in Israel for Israeli weddings*

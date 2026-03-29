-- ============================================
-- WEDDING APP - SUPABASE DATABASE SCHEMA v2
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE,
  venue TEXT DEFAULT '',
  venue_address TEXT DEFAULT '',
  bride_name TEXT DEFAULT '',
  groom_name TEXT DEFAULT '',
  total_budget DECIMAL(12,2) DEFAULT 0,
  cover_image_url TEXT,
  cover_message TEXT DEFAULT 'אנו שמחים להזמינכם לחגוג עמנו את יום חתונתנו המיוחד!',
  bit_link TEXT DEFAULT '',
  paybox_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own events" ON events FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'maybe')),
  category TEXT DEFAULT 'other' CHECK (category IN ('family', 'friends', 'work', 'other')),
  table_id UUID,
  seat_number INTEGER,
  party_size INTEGER DEFAULT 1,
  confirmed_count INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_sent_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  whatsapp_status TEXT CHECK (whatsapp_status IN ('sent', 'delivered', 'read', 'failed') OR whatsapp_status IS NULL),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their event guests" ON guests FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 8,
  shape TEXT DEFAULT 'round' CHECK (shape IN ('round', 'rectangle', 'oval')),
  position_x DECIMAL DEFAULT 100,
  position_y DECIMAL DEFAULT 100,
  notes TEXT DEFAULT ''
);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their event tables" ON tables FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

ALTER TABLE guests ADD CONSTRAINT guests_table_fk FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#dc9229'
);
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their budget categories" ON budget_categories FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  vendor_id UUID,
  description TEXT NOT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,
  advance_paid DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their expenses" ON expenses FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their incomes" ON incomes FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS blessings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blessings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read blessings" ON blessings FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can add a blessing" ON blessings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Event owner can manage blessings" ON blessings FOR DELETE USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price_range TEXT DEFAULT '',
  location TEXT DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read vendors" ON vendors FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users insert own vendors" ON vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vendors" ON vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own vendors" ON vendors FOR DELETE USING (auth.uid() = user_id);

INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system) 
SELECT 'סטודיו אור - צילום','צלמים','052-1234567','צלמי חתונות מקצועיים עם 15 שנות ניסיון','8,000-15,000','תל אביב והמרכז',4.9,124,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE is_system = TRUE LIMIT 1);
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'DJ מיקי פרץ','DJ','054-9876543','DJ מוביל לאירועים ומסיבות','5,000-10,000','ארצי',4.8,89,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'DJ מיקי פרץ');
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'פרחי גליל','עיצוב פרחוני','053-4567890','עיצוב פרחוני יוקרתי לחתונות','6,000-20,000','הצפון',5.0,67,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'פרחי גליל');
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'קייטרינג הגינה','קייטרינג','02-5678901','קייטרינג כשר בהשגחה מהודרת','180-350 לאיש','ירושלים',4.7,203,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'קייטרינג הגינה');
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'אולם הגן הסגור','אולמות','09-8901234','אולם אירועים יוקרתי עם גינה','50,000-120,000','השרון',4.9,156,FALSE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'אולם הגן הסגור');
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'מספרת שרית','ספרות וסטיילינג','050-3456789','עיצוב שיער ואיפור לכלות','1,500-4,000','תל אביב',4.8,312,TRUE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'מספרת שרית');
INSERT INTO vendors (name, category, phone, description, price_range, location, rating, review_count, is_recommended, is_system)
SELECT 'לימוזין רותם','הסעות','053-7890123','השכרת רכבי יוקרה ולימוזינים','1,200-3,500','המרכז',4.6,78,FALSE,TRUE
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'לימוזין רותם');

CREATE OR REPLACE FUNCTION create_default_budget_categories(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM budget_categories WHERE event_id = p_event_id) THEN
    INSERT INTO budget_categories (event_id, name, icon, color) VALUES
      (p_event_id, 'אולם', '🏛️', '#8B5E3C'),
      (p_event_id, 'צילום', '📷', '#4A7C59'),
      (p_event_id, 'מוזיקה ו-DJ', '🎵', '#7B4EA6'),
      (p_event_id, 'קייטרינג', '🍽️', '#D4500E'),
      (p_event_id, 'עיצוב ופרחים', '💐', '#C4498A'),
      (p_event_id, 'שמלה וחליפה', '👗', '#2B7FA6'),
      (p_event_id, 'הסעות', '🚗', '#5A8A3E'),
      (p_event_id, 'כרטיסים והזמנות', '✉️', '#C4901A'),
      (p_event_id, 'ספרות ואיפור', '💄', '#C44B6A'),
      (p_event_id, 'שונות', '📋', '#6B7280');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_table_id ON guests(table_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_incomes_event_id ON incomes(event_id);
CREATE INDEX IF NOT EXISTS idx_tables_event_id ON tables(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_blessings_event_id ON blessings(event_id);

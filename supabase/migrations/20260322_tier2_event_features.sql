-- ── Tier 2 Event Features Migration ─────────────────────────────────────────
-- 1. Waitlist table
-- 2. Recurring event support (via category_data JSONB — no extra columns needed)

-- ── 1. Event Waitlist ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  notified_at TIMESTAMPTZ DEFAULT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One entry per email per listing
CREATE UNIQUE INDEX IF NOT EXISTS event_waitlist_listing_email_idx
  ON event_waitlist (listing_id, lower(email));

-- Index for fast waitlist lookup by listing
CREATE INDEX IF NOT EXISTS event_waitlist_listing_idx
  ON event_waitlist (listing_id);

-- RLS
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- Authenticated users can join/leave their own slot (matched by user_id or email)
CREATE POLICY "Users manage own waitlist entry" ON event_waitlist
  FOR ALL USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Vendors can read the waitlist for their own listings
CREATE POLICY "Vendors read waitlist for own listings" ON event_waitlist
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM listings
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

-- Admin full access for notification cron
-- (handled by service-role key which bypasses RLS)

-- ── Event Features Migration ────────────────────────────────────────────────
-- Adds: visibility, custom_questions, event_date, event_time to listings; promo_codes table

-- 1. Listing visibility (draft | public | private)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('draft', 'public', 'private'));

-- 2. Custom attendee questions (JSONB array of question objects)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS custom_questions JSONB NOT NULL DEFAULT '[]';

-- 3. Event date and time (for event organizer listings)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS event_time TIME;

-- 4. Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID REFERENCES listings(id) ON DELETE CASCADE,
  vendor_id       UUID REFERENCES vendors(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  discount_type   TEXT NOT NULL DEFAULT 'percentage'
                    CHECK (discount_type IN ('percentage', 'flat')),
  discount_value  NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses        INT DEFAULT NULL,
  used_count      INT NOT NULL DEFAULT 0,
  valid_until     DATE DEFAULT NULL,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce unique code per listing
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_listing_code_idx
  ON promo_codes (listing_id, UPPER(code));

-- RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Vendors manage their own codes
CREATE POLICY "Vendors manage own promo codes" ON promo_codes
  FOR ALL USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Customers can read active codes to validate at checkout
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT USING (active = true);

-- 5. Index for fast promo code lookup at checkout
CREATE INDEX IF NOT EXISTS promo_codes_code_idx ON promo_codes (UPPER(code));

-- 6. Only public listings should appear in public search
-- (RLS on listings: reading draft/private listings requires ownership)
-- Add a policy so non-owners can only see public active listings
-- Note: this should be combined with existing listing RLS policies.
-- If no RLS policy exists yet, create one:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Public listings are visible to all'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public listings are visible to all" ON listings
        FOR SELECT USING (
          visibility = 'public'
          OR vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
          )
        );
    $policy$;
  END IF;
END $$;

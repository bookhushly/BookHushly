-- Booking locks: prevent double-booking by locking a listing during active payment
CREATE TABLE IF NOT EXISTS booking_locks (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id    uuid        NOT NULL,
  listing_type  text        NOT NULL CHECK (listing_type IN ('hotel', 'apartment', 'event')),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id    uuid,                          -- set after booking record is created
  expires_at    timestamptz NOT NULL,          -- lock expires after payment window (default 15 min)
  created_at    timestamptz DEFAULT now()
);

-- Only one active lock per listing at a time (partial unique index on non-expired locks)
CREATE UNIQUE INDEX IF NOT EXISTS booking_locks_active_listing
  ON booking_locks (listing_id, listing_type)
  WHERE expires_at > now();

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS booking_locks_user_id ON booking_locks (user_id);

-- Enable RLS
ALTER TABLE booking_locks ENABLE ROW LEVEL SECURITY;

-- Users can read locks (to check if a listing is locked)
CREATE POLICY "Anyone can read booking locks"
  ON booking_locks FOR SELECT USING (true);

-- Only the lock owner can insert their own lock
CREATE POLICY "Users can create their own locks"
  ON booking_locks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the lock owner can delete their own lock
CREATE POLICY "Users can delete their own locks"
  ON booking_locks FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically clean up expired locks (call via pg_cron or on-demand)
CREATE OR REPLACE FUNCTION cleanup_expired_booking_locks()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM booking_locks WHERE expires_at <= now();
$$;

-- Add Meet Your Host / Agent fields to serviced_apartments
ALTER TABLE serviced_apartments
  ADD COLUMN IF NOT EXISTS agent_name        text,
  ADD COLUMN IF NOT EXISTS agent_phone       text,
  ADD COLUMN IF NOT EXISTS agent_image_url   text,
  ADD COLUMN IF NOT EXISTS agent_bio         text;

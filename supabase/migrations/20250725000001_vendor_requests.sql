-- Create common schema
CREATE SCHEMA IF NOT EXISTS common;

-- Create the set_updated_at function
CREATE OR REPLACE FUNCTION common.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create vendor_requests table
CREATE TABLE vendor_requests (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT NOT NULL,
    business_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    business_registration_number TEXT,
    tax_identification_number TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    business_category TEXT,
    years_in_operation INTEGER,
    website_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE vendor_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own requests
CREATE POLICY "Users can view their own requests"
    ON vendor_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can create their own requests"
    ON vendor_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow admin to view all requests
CREATE POLICY "Admins can view all requests"
    ON vendor_requests FOR SELECT
    USING (auth.jwt()->>'role' = 'admin');

-- Allow admin to update requests
CREATE POLICY "Admins can update requests"
    ON vendor_requests FOR UPDATE
    USING (auth.jwt()->>'role' = 'admin');

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON vendor_requests
    FOR EACH ROW
    EXECUTE FUNCTION common.set_updated_at();

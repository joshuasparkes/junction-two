-- Policy Management Tables for Junction Two Travel Platform

-- Organization Policies Table
CREATE TABLE organization_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    pre_trip_approval VARCHAR(50) NOT NULL CHECK (pre_trip_approval IN ('never', 'always', 'only_when_out_of_policy')),
    out_of_policy_message TEXT,
    flight_rules TEXT, -- leave blank for now
    paid_seats TEXT, -- leave blank for now
    refundable_fares TEXT, -- leave blank for now
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(org_id, name)
);

-- Policy Groups Table  
CREATE TABLE policy_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0, -- for ordering policy groups
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(org_id, name)
);

-- Out of Policy Reasons Table
CREATE TABLE out_of_policy_reasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Payment Methods Table (for mock data)
CREATE TABLE payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'bank_account')),
    card_brand VARCHAR(50), -- visa, mastercard, amex, etc.
    last_four_digits VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name VARCHAR(255),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User Invitations Table
CREATE TABLE user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invitation_token UUID DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, email)
);

-- Enable RLS on all tables
ALTER TABLE organization_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE out_of_policy_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_policies
CREATE POLICY "Users can view org policies for their organizations" ON organization_policies
    FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage org policies" ON organization_policies
    FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS Policies for policy_groups
CREATE POLICY "Users can view policy groups for their organizations" ON policy_groups
    FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage policy groups" ON policy_groups
    FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS Policies for out_of_policy_reasons
CREATE POLICY "Users can view out of policy reasons for their organizations" ON out_of_policy_reasons
    FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage out of policy reasons" ON out_of_policy_reasons
    FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS Policies for payment_methods
CREATE POLICY "Users can view payment methods for their organizations" ON payment_methods
    FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage payment methods" ON payment_methods
    FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS Policies for user_invitations
CREATE POLICY "Users can view invitations for their organizations" ON user_invitations
    FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage invitations" ON user_invitations
    FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- Insert some sample data for development
INSERT INTO organization_policies (org_id, name, pre_trip_approval, out_of_policy_message) 
SELECT 
    o.id,
    'Default Travel Policy',
    'only_when_out_of_policy',
    'Please provide justification for out-of-policy bookings'
FROM organizations o 
LIMIT 1;

INSERT INTO policy_groups (org_id, name, description, priority)
SELECT 
    o.id,
    unnest(ARRAY['Executive Travel', 'Standard Travel', 'Budget Travel']),
    unnest(ARRAY['High-tier travel options for executives', 'Standard business travel guidelines', 'Cost-effective travel options']),
    unnest(ARRAY[1, 2, 3])
FROM organizations o 
LIMIT 1;

INSERT INTO out_of_policy_reasons (org_id, reason, description, requires_approval)
SELECT 
    o.id,
    unnest(ARRAY['Last minute booking', 'Client meeting requirement', 'No alternative available', 'Emergency travel']),
    unnest(ARRAY['Booking made within 24 hours of travel', 'Required for important client meeting', 'No policy-compliant options available', 'Urgent business need']),
    unnest(ARRAY[true, false, true, true])
FROM organizations o 
LIMIT 1;

-- Insert sample payment methods
INSERT INTO payment_methods (org_id, type, card_brand, last_four_digits, expiry_month, expiry_year, cardholder_name, is_default)
SELECT 
    o.id,
    unnest(ARRAY['credit_card', 'credit_card']),
    unnest(ARRAY['visa', 'mastercard']),
    unnest(ARRAY['1234', '5678']),
    unnest(ARRAY[12, 6]),
    unnest(ARRAY[2027, 2026]),
    unnest(ARRAY['Company Travel Account', 'Backup Corporate Card']),
    unnest(ARRAY[true, false])
FROM organizations o 
LIMIT 1;
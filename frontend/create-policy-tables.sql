-- Policy Engine Tables for Junction Two Travel
-- Run this in your Supabase SQL editor

-- Main policies table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    label VARCHAR(512) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'TRAVEL', -- TRAVEL, ORG
    active BOOLEAN NOT NULL DEFAULT true,
    action VARCHAR(32) NOT NULL DEFAULT 'OUT_OF_POLICY', -- HIDE, BLOCK, APPROVE, OUT_OF_POLICY
    enforce_approval BOOLEAN NOT NULL DEFAULT false,
    message_for_reservation JSONB,
    exclude_restricted_fares BOOLEAN NOT NULL DEFAULT false,
    refundable_fares_enabled BOOLEAN NOT NULL DEFAULT false,
    user_count BIGINT DEFAULT 0,
    guest_count BIGINT DEFAULT 0,
    approver_count BIGINT DEFAULT 0
);

-- Policy rules table
CREATE TABLE IF NOT EXISTS policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL, -- rule specification type
    action VARCHAR(32) NOT NULL, -- HIDE, BLOCK, APPROVE, OUT_OF_POLICY
    vars JSONB, -- rule parameters
    active BOOLEAN NOT NULL DEFAULT true
);

-- Policy rule exceptions table
CREATE TABLE IF NOT EXISTS policy_rule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    policy_rule_id UUID NOT NULL REFERENCES policy_rules(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL, -- exception specification type
    vars JSONB, -- exception parameters
    active BOOLEAN NOT NULL DEFAULT true
);

-- Policy approvers table
CREATE TABLE IF NOT EXISTS policy_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(policy_id, user_id)
);

-- User policy assignments table
CREATE TABLE IF NOT EXISTS user_policy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, policy_id)
);

-- Rail stations/cities for location-based policies
CREATE TABLE IF NOT EXISTS policy_rail_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_code VARCHAR(10) NOT NULL UNIQUE,
    station_name VARCHAR(200) NOT NULL,
    city_name VARCHAR(200) NOT NULL,
    country_code VARCHAR(3) NOT NULL
);

-- Rail operators for preference policies
CREATE TABLE IF NOT EXISTS policy_rail_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_code VARCHAR(10) NOT NULL UNIQUE,
    operator_name VARCHAR(200) NOT NULL,
    country_code VARCHAR(3) NOT NULL
);

-- Organization rail preferences
CREATE TABLE IF NOT EXISTS org_rail_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    operator_code VARCHAR(10) NOT NULL,
    policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
    preference_level INTEGER NOT NULL DEFAULT 0, -- 0 = preferred, 1 = acceptable, -1 = avoid
    UNIQUE(org_id, operator_code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_org_id ON policies(org_id);
CREATE INDEX IF NOT EXISTS idx_policies_active ON policies(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_policy_rules_policy_id ON policy_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_rules_active ON policy_rules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_policy_rule_exceptions_rule_id ON policy_rule_exceptions(policy_rule_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvers_policy_id ON policy_approvers(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvers_user_id ON policy_approvers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_policy_assignments_user_id ON user_policy_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_policy_assignments_policy_id ON user_policy_assignments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_rail_stations_code ON policy_rail_stations(station_code);
CREATE INDEX IF NOT EXISTS idx_policy_rail_operators_code ON policy_rail_operators(operator_code);
CREATE INDEX IF NOT EXISTS idx_org_rail_preferences_org_id ON org_rail_preferences(org_id);

-- Create approval_requests table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    travel_data JSONB NOT NULL,
    policy_evaluation JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_org_id ON approval_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_user_id ON approval_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_rule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_policy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_rail_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see policies from their organizations
CREATE POLICY "Users can view org policies" ON policies
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage org policies" ON policies
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('manager', 'admin')
        )
    );

-- Policy rules inherit from policies
CREATE POLICY "Users can view org policy rules" ON policy_rules
    FOR SELECT USING (
        policy_id IN (
            SELECT id FROM policies 
            WHERE org_id IN (
                SELECT org_id FROM user_organizations 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage org policy rules" ON policy_rules
    FOR ALL USING (
        policy_id IN (
            SELECT id FROM policies 
            WHERE org_id IN (
                SELECT org_id FROM user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('manager', 'admin')
            )
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view org policy exceptions" ON policy_rule_exceptions
    FOR SELECT USING (
        policy_rule_id IN (
            SELECT pr.id FROM policy_rules pr
            JOIN policies p ON pr.policy_id = p.id
            WHERE p.org_id IN (
                SELECT org_id FROM user_organizations 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage org policy exceptions" ON policy_rule_exceptions
    FOR ALL USING (
        policy_rule_id IN (
            SELECT pr.id FROM policy_rules pr
            JOIN policies p ON pr.policy_id = p.id
            WHERE p.org_id IN (
                SELECT org_id FROM user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('manager', 'admin')
            )
        )
    );

-- Insert some sample rail stations and operators
INSERT INTO policy_rail_stations (station_code, station_name, city_name, country_code) VALUES
('LDN', 'London St Pancras', 'London', 'GBR'),
('PAR', 'Paris Gare du Nord', 'Paris', 'FRA'),
('BRU', 'Brussels Central', 'Brussels', 'BEL'),
('AMS', 'Amsterdam Central', 'Amsterdam', 'NLD')
ON CONFLICT (station_code) DO NOTHING;

INSERT INTO policy_rail_operators (operator_code, operator_name, country_code) VALUES
('EUR', 'Eurostar', 'GBR'),
('THA', 'Thalys', 'FRA'),
('ICE', 'ICE', 'DEU'),
('AVE', 'AVE', 'ESP')
ON CONFLICT (operator_code) DO NOTHING;

-- Create a sample policy for testing (using your organization ID)
INSERT INTO policies (org_id, label, type, active, action, enforce_approval) 
SELECT '4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c'::uuid, 'Standard Rail Travel Policy', 'TRAVEL', true, 'OUT_OF_POLICY', false
WHERE NOT EXISTS (SELECT 1 FROM policies WHERE label = 'Standard Rail Travel Policy');

-- Add sample rules to the policy
INSERT INTO policy_rules (policy_id, code, action, vars, active)
SELECT 
    p.id,
    'train_max_od_price',
    'APPROVE',
    '{"max_price": 200, "currency": "EUR", "trip_type": "one_way"}'::jsonb,
    true
FROM policies p 
WHERE p.label = 'Standard Rail Travel Policy'
AND NOT EXISTS (
    SELECT 1 FROM policy_rules pr 
    WHERE pr.policy_id = p.id AND pr.code = 'train_max_od_price'
);

INSERT INTO policy_rules (policy_id, code, action, vars, active)
SELECT 
    p.id,
    'train_class_max',
    'BLOCK',
    '{"max_class": "FIRST", "exclude_premium": false}'::jsonb,
    true
FROM policies p 
WHERE p.label = 'Standard Rail Travel Policy'
AND NOT EXISTS (
    SELECT 1 FROM policy_rules pr 
    WHERE pr.policy_id = p.id AND pr.code = 'train_class_max'
);

-- RLS Policies for approval_requests
CREATE POLICY "Users can view org approval requests" ON approval_requests
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create approval requests" ON approval_requests
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Approvers can update approval requests" ON approval_requests
    FOR UPDATE USING (
        approver_id = auth.uid()
        OR org_id IN (
            SELECT org_id FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('manager', 'admin')
        )
    );

-- Update the policy engine service URL
-- Add this to your environment variables:
-- REACT_APP_POLICY_ENGINE_URL=http://localhost:5001
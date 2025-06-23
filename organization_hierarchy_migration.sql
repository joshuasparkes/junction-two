-- Add parent-child relationship columns to organizations table
ALTER TABLE organizations 
ADD COLUMN parent_org_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
ADD COLUMN is_parent BOOLEAN DEFAULT FALSE;

-- Check if created_by foreign key exists and what it references
-- If it's causing issues, we might need to drop and recreate it
-- First, let's see what foreign keys exist on the organizations table:
-- \d+ organizations;

-- Add constraint to prevent circular references
ALTER TABLE organizations 
ADD CONSTRAINT no_self_parent CHECK (parent_org_id != id);

-- Create index for efficient child organization queries
CREATE INDEX idx_organizations_parent_org_id ON organizations(parent_org_id);

-- Create a view for easy parent-child organization queries
CREATE VIEW organization_hierarchy AS
SELECT 
    p.id as parent_id,
    p.name as parent_name,
    p.owner_id as parent_owner_id,
    c.id as child_id,
    c.name as child_name,
    c.created_at as child_created_at,
    c.owner_id as child_owner_id
FROM organizations p
LEFT JOIN organizations c ON p.id = c.parent_org_id
WHERE p.is_parent = TRUE;
-- Supabase Database Schema for Junction Two Travel App
-- Run these SQL commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL
);

-- User-Organization relationships with roles
CREATE TABLE user_organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID REFERENCES organizations NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'booker', 'guest', 'user')),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, org_id)
);

-- Update trips table to reference organizations
ALTER TABLE trips ADD COLUMN org_id UUID REFERENCES organizations;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- User Organizations policies
CREATE POLICY "Users can view their organization memberships" ON user_organizations
  FOR SELECT USING (
    user_id = auth.uid() OR 
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('manager', 'booker')
    )
  );

CREATE POLICY "Users can join organizations" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can update user roles in their org" ON user_organizations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Users and managers can remove memberships" ON user_organizations
  FOR DELETE USING (
    user_id = auth.uid() OR 
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Trips policies (updated)
CREATE POLICY "Users can view trips in their organizations" ON trips
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create trips in their organizations" ON trips
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid()
    ) OR org_id IS NULL
  );

CREATE POLICY "Users can update their own trips or org trips with proper role" ON trips
  FOR UPDATE USING (
    created_by = auth.uid() OR
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('manager', 'booker')
    )
  );

CREATE POLICY "Users can delete their own trips or org trips with manager role" ON trips
  FOR DELETE USING (
    created_by = auth.uid() OR
    org_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(org_id);
CREATE INDEX idx_trips_org_id ON trips(org_id);
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_organizations_name ON organizations(name);

-- Sample data (optional - for testing)
-- Note: This assumes you have created a user through Supabase Auth first

/*
-- Insert sample organization (replace with actual user UUID)
INSERT INTO organizations (name, created_by) 
VALUES ('Sample Travel Agency', 'your-user-uuid-here');

-- Insert user to organization relationship
INSERT INTO user_organizations (user_id, org_id, role, is_primary)
SELECT 'your-user-uuid-here', id, 'manager', true
FROM organizations WHERE name = 'Sample Travel Agency';
*/
-- Supabase Database Schema for Junction Two Travel App - FIXED
-- Run these SQL commands in your Supabase SQL Editor

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their organization memberships" ON user_organizations;
DROP POLICY IF EXISTS "Managers can update user roles in their org" ON user_organizations;
DROP POLICY IF EXISTS "Users and managers can remove memberships" ON user_organizations;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL
);

-- User-Organization relationships with roles
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID REFERENCES organizations NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'booker', 'guest', 'user')),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, org_id)
);

-- Update trips table to reference organizations (if trips table exists)
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trips') THEN
    ALTER TABLE trips ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations;
  END IF;
END $$;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Managers can update their organizations" ON organizations;

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
    EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_organizations.org_id = organizations.id 
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can update their organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_organizations.org_id = organizations.id 
      AND user_organizations.user_id = auth.uid() 
      AND user_organizations.role = 'manager'
    )
  );

-- User Organizations policies - FIXED to avoid infinite recursion
CREATE POLICY "Users can view their own memberships" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view org memberships" ON user_organizations
  FOR SELECT USING (
    org_id IN (
      SELECT uo.org_id FROM user_organizations uo 
      WHERE uo.user_id = auth.uid() AND uo.role = 'manager'
    )
  );

CREATE POLICY "Users can join organizations" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can update user roles" ON user_organizations
  FOR UPDATE USING (
    org_id IN (
      SELECT uo.org_id FROM user_organizations uo 
      WHERE uo.user_id = auth.uid() AND uo.role = 'manager'
    )
  );

CREATE POLICY "Users can leave organizations" ON user_organizations
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Managers can remove users from org" ON user_organizations
  FOR DELETE USING (
    org_id IN (
      SELECT uo.org_id FROM user_organizations uo 
      WHERE uo.user_id = auth.uid() AND uo.role = 'manager'
    )
  );

-- Trips policies (if trips table exists)
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trips') THEN
    ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view trips in their organizations" ON trips;
    DROP POLICY IF EXISTS "Users can create trips in their organizations" ON trips;
    DROP POLICY IF EXISTS "Users can update their own trips or org trips with proper role" ON trips;
    DROP POLICY IF EXISTS "Users can delete their own trips or org trips with manager role" ON trips;
    
    CREATE POLICY "Users can view trips in their organizations" ON trips
      FOR SELECT USING (
        org_id IN (
          SELECT uo.org_id FROM user_organizations uo 
          WHERE uo.user_id = auth.uid()
        ) OR created_by = auth.uid()
      );

    CREATE POLICY "Users can create trips in their organizations" ON trips
      FOR INSERT WITH CHECK (
        org_id IN (
          SELECT uo.org_id FROM user_organizations uo 
          WHERE uo.user_id = auth.uid()
        ) OR org_id IS NULL
      );

    CREATE POLICY "Users can update their own trips or org trips with proper role" ON trips
      FOR UPDATE USING (
        created_by = auth.uid() OR
        org_id IN (
          SELECT uo.org_id FROM user_organizations uo 
          WHERE uo.user_id = auth.uid() AND uo.role IN ('manager', 'booker')
        )
      );

    CREATE POLICY "Users can delete their own trips or org trips with manager role" ON trips
      FOR DELETE USING (
        created_by = auth.uid() OR
        org_id IN (
          SELECT uo.org_id FROM user_organizations uo 
          WHERE uo.user_id = auth.uid() AND uo.role = 'manager'
        )
      );
  END IF;
END $$;

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
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
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
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON user_organizations(role);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
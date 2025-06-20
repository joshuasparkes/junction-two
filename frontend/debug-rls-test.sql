-- Test RLS policies for user_profiles table
-- Run this in Supabase SQL Editor while authenticated as your user

-- 1. Check if we can select our own profile (should work)
SELECT 'Test 1: Select own profile' as test_name;
SELECT * FROM user_profiles WHERE id = auth.uid();

-- 2. Check current user context
SELECT 'Test 2: Current auth context' as test_name;
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 3. Try to select all profiles (should only return current user's)
SELECT 'Test 3: Select all profiles (should be filtered)' as test_name;
SELECT id, email, first_name, last_name FROM user_profiles;

-- 4. Check if RLS is enabled
SELECT 'Test 4: RLS status' as test_name;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_profiles';
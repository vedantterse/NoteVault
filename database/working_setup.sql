-- RUN THIS FILE TO SET UP A FRESH DATABASE FOR DEVELOPMENT/TESTING

-- RUN THIS FILE ON THE SUPABASE SQL EDITOR 

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Create Tenants Table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Notes Table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tenant_id ON notes(tenant_id);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- Disable RLS for now (application handles security)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert tenants
INSERT INTO tenants (id, name, slug, subscription_plan) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Acme Corporation', 'acme', 'free'),
  ('22222222-2222-2222-2222-222222222222', 'Globex Corporation', 'globex', 'free');

-- Insert test users with CORRECT password hash for "password"
-- This hash was generated with the same bcrypt version as the app
INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES 
  -- Acme Corporation Users
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@acme.test', '$2b$12$LQSlEif8vkBVwHeIn5smGevXfGgQagcyyep6PEnEIS1i4r1OvFNtu', 'admin', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user@acme.test', '$2b$12$LQSlEif8vkBVwHeIn5smGevXfGgQagcyyep6PEnEIS1i4r1OvFNtu', 'member', '11111111-1111-1111-1111-111111111111'),
  
  -- Globex Corporation Users
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@globex.test', '$2b$12$LQSlEif8vkBVwHeIn5smGevXfGgQagcyyep6PEnEIS1i4r1OvFNtu', 'admin', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'user@globex.test', '$2b$12$LQSlEif8vkBVwHeIn5smGevXfGgQagcyyep6PEnEIS1i4r1OvFNtu', 'member', '22222222-2222-2222-2222-222222222222');

-- Insert demo notes
INSERT INTO notes (title, content, user_id, tenant_id) VALUES 
  -- Acme notes
  ('Welcome to Acme!', 'This is your first note in the Acme Corporation workspace. You can create, edit, and manage notes here.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('Meeting Notes', 'Quarterly review meeting scheduled for next week. Please prepare your reports.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  
  -- Globex notes  
  ('Globex Project Plan', 'Initial project setup and requirements gathering. Phase 1 starts next month.', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'),
  ('Team Updates', 'Weekly team sync and progress updates. All milestones on track.', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222');

-- Verify the setup
SELECT 'Setup completed successfully!' as message;
SELECT 'Tenants created:' as info, COUNT(*) as count FROM tenants;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Notes created:' as info, COUNT(*) as count FROM notes;

-- Show all test accounts
SELECT 
  email,
  role,
  CASE 
    WHEN tenant_id = '11111111-1111-1111-1111-111111111111' THEN 'Acme Corporation'
    WHEN tenant_id = '22222222-2222-2222-2222-222222222222' THEN 'Globex Corporation'
    ELSE 'Unknown'
  END as company
FROM users
ORDER BY company, role;
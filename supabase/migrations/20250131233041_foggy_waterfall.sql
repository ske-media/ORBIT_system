/*
  # Fix schema for contact temperature and company country

  1. Changes
    - Add 'client' value to contact_temperature enum if not exists
    - Add country column to companies table if not exists
    - Update RLS policies to include new fields
*/

-- Add 'client' to contact_temperature enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid 
    WHERE typname = 'contact_temperature' 
    AND enumlabel = 'client'
  ) THEN
    ALTER TYPE contact_temperature ADD VALUE 'client';
  END IF;
END $$;

-- Add country column to companies if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE companies ADD COLUMN country text;
  END IF;
END $$;

-- Update RLS policies to include new fields
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can delete companies" ON companies;

DROP POLICY IF EXISTS "Users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;

-- Create updated policies for companies
CREATE POLICY "Users can view companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated policies for contacts
CREATE POLICY "Users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true);
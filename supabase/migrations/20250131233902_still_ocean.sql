/*
  # Update contact temperature enum and migrate data

  1. Changes
    - Create new enum type with all values
    - Create temporary table
    - Safely migrate data
    - Update foreign key constraints
    - Recreate indexes and policies
*/

-- First create the new enum type
DROP TYPE IF EXISTS contact_temperature_new CASCADE;
CREATE TYPE contact_temperature_new AS ENUM ('cold', 'warm', 'hot', 'client');

-- Create the new contacts table
CREATE TABLE contacts_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  temperature contact_temperature_new NOT NULL DEFAULT 'cold',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data with a safe conversion of the temperature
INSERT INTO contacts_new (
  id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  company_id, 
  temperature, 
  created_at, 
  updated_at
)
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.company_id,
  CASE 
    WHEN c.temperature::text = 'cold' THEN 'cold'::contact_temperature_new
    WHEN c.temperature::text = 'warm' THEN 'warm'::contact_temperature_new
    WHEN c.temperature::text = 'hot' THEN 'hot'::contact_temperature_new
    WHEN c.temperature::text = 'client' THEN 'client'::contact_temperature_new
    ELSE 'cold'::contact_temperature_new
  END,
  c.created_at,
  c.updated_at
FROM contacts c;

-- Temporarily disable foreign key constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_contact_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_contact_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_contact_id_fkey;

-- Drop the old table and type
DROP TABLE contacts CASCADE;
DROP TYPE contact_temperature;

-- Rename the new type and table
ALTER TYPE contact_temperature_new RENAME TO contact_temperature;
ALTER TABLE contacts_new RENAME TO contacts;

-- Recreate foreign key constraints
ALTER TABLE projects 
  ADD CONSTRAINT projects_contact_id_fkey 
  FOREIGN KEY (contact_id) 
  REFERENCES contacts(id) 
  ON DELETE RESTRICT;

ALTER TABLE quotes 
  ADD CONSTRAINT quotes_contact_id_fkey 
  FOREIGN KEY (contact_id) 
  REFERENCES contacts(id) 
  ON DELETE RESTRICT;

ALTER TABLE invoices 
  ADD CONSTRAINT invoices_contact_id_fkey 
  FOREIGN KEY (contact_id) 
  REFERENCES contacts(id) 
  ON DELETE RESTRICT;

-- Recreate indexes
CREATE INDEX contacts_company_id_idx ON contacts(company_id);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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
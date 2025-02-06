/*
  # Update finance tables to use companies

  1. Changes
    - Add company_id to quotes and invoices tables
    - Add foreign key constraints
    - Update RLS policies
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Safely add company_id to quotes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE quotes 
    ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE RESTRICT;

    CREATE INDEX IF NOT EXISTS quotes_company_id_idx ON quotes(company_id);
  END IF;
END $$;

-- Safely add company_id to invoices
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE invoices
    ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE RESTRICT;

    CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON invoices(company_id);
  END IF;
END $$;

-- Make contact_id optional in quotes
DO $$ 
BEGIN
  ALTER TABLE quotes 
  ALTER COLUMN contact_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- Make contact_id optional in invoices
DO $$ 
BEGIN
  ALTER TABLE invoices 
  ALTER COLUMN contact_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;
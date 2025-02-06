/*
  # Fix contact-company relationship

  1. Changes
    - Add company_id column to contacts table if it doesn't exist
    - Create index for company_id
    - Add foreign key constraint
*/

DO $$ 
BEGIN
  -- Add company_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
    CREATE INDEX contacts_company_id_idx ON contacts(company_id);
  END IF;
END $$;
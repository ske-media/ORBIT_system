/*
  # Add company_id to quotes and invoices

  1. Changes
    - Add company_id column to quotes table
    - Add company_id column to invoices table
    - Create indexes for performance optimization
    - Add foreign key constraints

  2. Safety Measures
    - Use IF NOT EXISTS checks to prevent errors
    - Wrap changes in DO block for atomicity
*/

DO $$ 
BEGIN
  -- Add company_id to quotes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE quotes
    ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE RESTRICT;
    
    CREATE INDEX IF NOT EXISTS quotes_company_id_idx ON quotes(company_id);
  END IF;

  -- Add company_id to invoices if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE invoices
    ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE RESTRICT;
    
    CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON invoices(company_id);
  END IF;
END $$;
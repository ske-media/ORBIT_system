-- Check if project_id columns exist and add them if they don't
DO $$ 
BEGIN
  -- Add project_id to quotes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE quotes
    ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE RESTRICT;
    
    CREATE INDEX quotes_project_id_idx ON quotes(project_id);
  END IF;

  -- Add project_id to invoices if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE invoices
    ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE RESTRICT;
    
    CREATE INDEX invoices_project_id_idx ON invoices(project_id);
  END IF;
END $$;
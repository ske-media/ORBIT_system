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
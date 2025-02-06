/*
  # User Settings Schema Update

  1. Changes
    - Safely create user settings table if it doesn't exist
    - Add policies only if they don't exist
    - Add indexes and triggers with conflict handling
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add unique constraint on user_id
*/

-- Create user settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_settings'
  ) THEN
    CREATE TABLE user_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      dark_mode boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT unique_user_settings UNIQUE (user_id)
    );

    -- Enable RLS
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create policies
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can view their own settings'
  ) THEN
    CREATE POLICY "Users can view their own settings"
      ON user_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can insert their own settings'
  ) THEN
    CREATE POLICY "Users can insert their own settings"
      ON user_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can update their own settings'
  ) THEN
    CREATE POLICY "Users can update their own settings"
      ON user_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can delete their own settings'
  ) THEN
    CREATE POLICY "Users can delete their own settings"
      ON user_settings
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'user_settings' 
    AND indexname = 'idx_user_settings_user_id'
  ) THEN
    CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS set_user_settings_timestamp ON user_settings;
CREATE TRIGGER set_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();
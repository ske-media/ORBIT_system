/*
  # Add password resets table

  1. New Tables
    - `password_resets`
      - `id` (uuid, primary key)
      - `email` (text)
      - `code` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create password resets"
  ON password_resets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own password resets"
  ON password_resets
  FOR SELECT
  TO anon, authenticated
  USING (email = current_user_email());

CREATE POLICY "Anyone can update their own password resets"
  ON password_resets
  FOR UPDATE
  TO anon, authenticated
  USING (email = current_user_email())
  WITH CHECK (email = current_user_email());

CREATE POLICY "Anyone can delete their own password resets"
  ON password_resets
  FOR DELETE
  TO anon, authenticated
  USING (email = current_user_email());

-- Create indexes
CREATE INDEX password_resets_email_idx ON password_resets(email);
CREATE INDEX password_resets_code_idx ON password_resets(code);
CREATE INDEX password_resets_expires_at_idx ON password_resets(expires_at);

-- Add trigger for updated_at
CREATE TRIGGER update_password_resets_updated_at
  BEFORE UPDATE ON password_resets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void AS $$
BEGIN
  DELETE FROM password_resets
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired codes every hour
SELECT cron.schedule(
  'cleanup-expired-password-resets',
  '0 * * * *',  -- Every hour
  'SELECT cleanup_expired_password_resets();'
);
/*
  # Add companies management
  
  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `address` (text)
      - `postal_code` (text)
      - `city` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `siret` (text)
      - `vat` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `company_id` to contacts table
    - Add foreign key constraint
    - Add index on company_id
    
  3. Security
    - Enable RLS on companies table
    - Add policies for authenticated users
*/

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  postal_code text,
  city text,
  phone text,
  email text,
  website text,
  siret text,
  vat text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add company_id to contacts
ALTER TABLE contacts 
ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX contacts_company_id_idx ON contacts(company_id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
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

-- Add trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
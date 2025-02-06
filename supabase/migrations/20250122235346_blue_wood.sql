/*
  # Finance Module Tables

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `quote_date` (timestamptz)
      - `status` (enum: draft, sent, accepted, rejected)
      - `total_amount` (decimal)
      - Created/updated timestamps
    - `invoices`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `invoice_date` (timestamptz)
      - `status` (enum: draft, sent, paid, overdue, cancelled)
      - `total_amount` (decimal)
      - Created/updated timestamps

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create enum types for finance statuses
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  quote_date timestamptz NOT NULL DEFAULT now(),
  status quote_status NOT NULL DEFAULT 'draft',
  total_amount decimal(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  invoice_date timestamptz NOT NULL DEFAULT now(),
  status invoice_status NOT NULL DEFAULT 'draft',
  total_amount decimal(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Allow authenticated users to read quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete quotes"
  ON quotes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for invoices
CREATE POLICY "Allow authenticated users to read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX quotes_contact_id_idx ON quotes(contact_id);
CREATE INDEX quotes_status_idx ON quotes(status);
CREATE INDEX invoices_contact_id_idx ON invoices(contact_id);
CREATE INDEX invoices_status_idx ON invoices(status);

-- Add triggers for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
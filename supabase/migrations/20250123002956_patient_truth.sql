/*
  # Add document lines for invoices and quotes

  1. New Tables
    - `invoice_lines`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `description` (text)
      - `quantity` (decimal)
      - `unit_price` (decimal)
      - `total_line_amount` (decimal, computed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quote_lines`
      - Same structure as invoice_lines but for quotes

  2. Changes
    - Add triggers to update total_amount in invoices and quotes
    - Add indexes for performance
    - Enable RLS with appropriate policies

  3. Notes
    - total_line_amount is computed as quantity * unit_price
    - total_amount in invoices/quotes is automatically updated
*/

-- Create invoice_lines table
CREATE TABLE invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_line_amount decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quote_lines table
CREATE TABLE quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_line_amount decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_lines
CREATE POLICY "Users can view invoice lines"
  ON invoice_lines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create invoice lines"
  ON invoice_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice lines"
  ON invoice_lines
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice lines"
  ON invoice_lines
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for quote_lines
CREATE POLICY "Users can view quote lines"
  ON quote_lines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create quote lines"
  ON quote_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update quote lines"
  ON quote_lines
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete quote lines"
  ON quote_lines
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX invoice_lines_invoice_id_idx ON invoice_lines(invoice_id);
CREATE INDEX quote_lines_quote_id_idx ON quote_lines(quote_id);

-- Create function to update invoice total
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET total_amount = (
    SELECT COALESCE(SUM(total_line_amount), 0)
    FROM invoice_lines
    WHERE invoice_id = NEW.invoice_id
  ),
  updated_at = now()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update quote total
CREATE OR REPLACE FUNCTION update_quote_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes
  SET total_amount = (
    SELECT COALESCE(SUM(total_line_amount), 0)
    FROM quote_lines
    WHERE quote_id = NEW.quote_id
  ),
  updated_at = now()
  WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_invoice_total_on_line_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_total();

CREATE TRIGGER update_quote_total_on_line_change
  AFTER INSERT OR UPDATE OR DELETE ON quote_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_total();

-- Add updated_at triggers
CREATE TRIGGER update_invoice_lines_updated_at
  BEFORE UPDATE ON invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quote_lines_updated_at
  BEFORE UPDATE ON quote_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
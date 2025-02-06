/*
  # Add invoice payments support
  
  1. New Tables
    - `invoice_payments`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key to invoices)
      - `payment_date` (timestamptz)
      - `amount_paid` (decimal)
      - `payment_method` (enum)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes
    - Add new payment_method enum type
    - Add triggers for automatic invoice status updates
    - Add RLS policies for invoice_payments
*/

-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'credit_card');

-- Create invoice_payments table
CREATE TABLE invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date timestamptz NOT NULL DEFAULT now(),
  amount_paid decimal(10,2) NOT NULL CHECK (amount_paid > 0),
  payment_method payment_method NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_payments
CREATE POLICY "Users can view invoice payments"
  ON invoice_payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create invoice payments"
  ON invoice_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice payments"
  ON invoice_payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice payments"
  ON invoice_payments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX invoice_payments_invoice_id_idx ON invoice_payments(invoice_id);
CREATE INDEX invoice_payments_payment_date_idx ON invoice_payments(payment_date);

-- Add trigger to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid decimal(10,2);
  invoice_total decimal(10,2);
BEGIN
  -- Calculate total amount paid
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = NEW.invoice_id;

  -- Get invoice total amount
  SELECT total_amount INTO invoice_total
  FROM invoices
  WHERE id = NEW.invoice_id;

  -- Update invoice status based on payment amount
  UPDATE invoices
  SET 
    status = CASE 
      WHEN total_paid >= invoice_total THEN 'paid'
      WHEN total_paid > 0 THEN 'partial_paid'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice status updates
CREATE TRIGGER update_invoice_status_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- Add updated_at trigger
CREATE TRIGGER update_invoice_payments_updated_at
  BEFORE UPDATE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
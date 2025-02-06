/*
  # Add partial_paid status to invoice_status enum

  1. Changes
    - Add 'partial_paid' value to invoice_status enum type
    - Update existing invoices with partial payments to use the new status
*/

-- Add partial_paid to invoice_status enum
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'partial_paid';

-- Update existing invoices with partial payments
DO $$
DECLARE
  invoice_record RECORD;
BEGIN
  FOR invoice_record IN 
    SELECT 
      i.id,
      i.total_amount,
      COALESCE(SUM(p.amount_paid), 0) as total_paid
    FROM invoices i
    LEFT JOIN invoice_payments p ON p.invoice_id = i.id
    GROUP BY i.id, i.total_amount
  LOOP
    IF invoice_record.total_paid > 0 AND invoice_record.total_paid < invoice_record.total_amount THEN
      UPDATE invoices
      SET status = 'partial_paid'
      WHERE id = invoice_record.id;
    END IF;
  END LOOP;
END $$;
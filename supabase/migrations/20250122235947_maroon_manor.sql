/*
  # Add project relations to quotes and invoices

  1. Changes
    - Add project_id column to quotes table (optional foreign key)
    - Add project_id column to invoices table (optional foreign key)
    - Add indexes for performance

  2. Notes
    - project_id is nullable to maintain backward compatibility
    - Foreign key constraints ensure data integrity
*/

-- Add project_id to quotes
ALTER TABLE quotes
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE RESTRICT;

-- Add project_id to invoices
ALTER TABLE invoices
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE RESTRICT;

-- Add indexes for performance
CREATE INDEX quotes_project_id_idx ON quotes(project_id);
CREATE INDEX invoices_project_id_idx ON invoices(project_id);
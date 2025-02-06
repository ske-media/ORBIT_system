/*
  # Add country field to companies

  1. Changes
    - Add country field to companies table
*/

ALTER TABLE companies ADD COLUMN IF NOT EXISTS country text;
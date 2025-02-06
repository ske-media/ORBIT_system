/*
  # Add client temperature value

  1. Changes
    - Add 'client' value to contact_temperature enum
*/

ALTER TYPE contact_temperature ADD VALUE IF NOT EXISTS 'client';
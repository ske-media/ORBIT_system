/*
  # Add default user

  1. Changes
    - Add a default user for development
    - Email: demo@example.com
    - Password: demo123
*/

-- Create default user with password 'demo123'
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@example.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Enable the user
UPDATE auth.users
SET confirmed_at = now(),
    email_confirmed_at = now(),
    last_sign_in_at = now()
WHERE email = 'demo@example.com';
/*
  # Fix authentication setup

  1. Changes
    - Drop and recreate users with proper encryption
    - Set up auth schema properly
    - Configure email restrictions
*/

-- Reset existing auth data
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;

-- Create users with proper auth functions
DO $$ 
DECLARE
  steven_uid uuid := gen_random_uuid();
  oceane_uid uuid := gen_random_uuid();
BEGIN
  -- Insert admin user (Steven)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_current,
    email_change_token_new,
    recovery_token,
    aud,
    role
  ) VALUES (
    steven_uid,
    '00000000-0000-0000-0000-000000000000',
    'steven@agence-orbit.ch',
    crypt('steven123', gen_salt('bf')), -- Simplified password for testing
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- Insert regular user (Océane)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_current,
    email_change_token_new,
    recovery_token,
    aud,
    role
  ) VALUES (
    oceane_uid,
    '00000000-0000-0000-0000-000000000000',
    'oceane@agence-orbit.ch',
    crypt('oceane123', gen_salt('bf')), -- Simplified password for testing
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "user"}',
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- Insert identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES
  (
    gen_random_uuid(),
    steven_uid,
    format('{"sub":"%s","email":"%s"}', steven_uid::text, 'steven@agence-orbit.ch')::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    oceane_uid,
    format('{"sub":"%s","email":"%s"}', oceane_uid::text, 'oceane@agence-orbit.ch')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- Configure email domain restriction
  UPDATE auth.config
  SET email_domains = '{agence-orbit.ch}'
  WHERE id = 1;
END $$;
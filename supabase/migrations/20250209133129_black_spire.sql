-- Configure auth settings
UPDATE auth.config
SET 
  enable_signup = true,
  disable_signup = false,
  mailer_autoconfirm = true,
  site_url = 'https://orbit.agence-orbit.ch',
  email_domains = '{agence-orbit.ch}';

-- Reset existing auth data
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;

-- Create users with proper SQL commands
DO $$ 
DECLARE
  steven_uid uuid := gen_random_uuid();
  oceane_uid uuid := gen_random_uuid();
BEGIN
  -- Create admin user (Steven)
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
    aud,
    role,
    is_super_admin
  ) VALUES (
    steven_uid,
    '00000000-0000-0000-0000-000000000000',
    'steven@agence-orbit.ch',
    crypt('steven123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "admin"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    false
  );

  -- Create regular user (Océane)
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
    aud,
    role,
    is_super_admin
  ) VALUES (
    oceane_uid,
    '00000000-0000-0000-0000-000000000000',
    'oceane@agence-orbit.ch',
    crypt('oceane123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "user"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    false
  );

  -- Create identities for users
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
END $$;
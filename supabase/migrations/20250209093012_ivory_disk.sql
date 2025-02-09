/*
  # Add initial users

  1. Changes
    - Insert initial admin and user accounts
    - Set up secure passwords
    - Configure email domains

  2. Security
    - Passwords are hashed by Supabase Auth
    - Only @agence-orbit.ch emails allowed
*/

-- Insert initial users
DO $$ 
BEGIN
  -- Insert admin user (Steven)
  PERFORM auth.create_user(
    uid := gen_random_uuid(),
    email := 'steven@agence-orbit.ch',
    email_confirm := true,
    password := 'E}6zJM?%G98QpSY2Cc.w/H',
    raw_user_meta_data := '{"role": "admin"}'::jsonb
  );

  -- Insert regular user (Océane)
  PERFORM auth.create_user(
    uid := gen_random_uuid(),
    email := 'oceane@agence-orbit.ch',
    email_confirm := true,
    password := 'mMHs5D;ySQKp*7GT(-h`<t',
    raw_user_meta_data := '{"role": "user"}'::jsonb
  );

  -- Configure email domain restriction
  UPDATE auth.config
  SET email_domains = '{agence-orbit.ch}'
  WHERE id = 1;
END $$;
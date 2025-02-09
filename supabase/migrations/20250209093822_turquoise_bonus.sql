/*
  # Correction de l'authentification

  1. Configuration
    - Active l'inscription par email
    - Active la confirmation automatique des emails
    - Restreint le domaine email à agence-orbit.ch
  
  2. Utilisateurs
    - Supprime les utilisateurs existants
    - Crée les utilisateurs avec auth.create_user()
    - Configure les rôles dans raw_user_meta_data
*/

-- Reset existing auth data
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;

-- Configure auth settings
UPDATE auth.config
SET 
  enable_signup = true,
  disable_signup = false,
  mailer_autoconfirm = true,
  site_url = 'https://orbit.agence-orbit.ch',
  email_domains = '{agence-orbit.ch}';

-- Create users with proper auth functions
DO $$ 
BEGIN
  -- Create admin user (Steven)
  PERFORM auth.create_user(
    uid := gen_random_uuid(),
    email := 'steven@agence-orbit.ch',
    password := 'steven123',
    email_confirm := true,
    raw_user_meta_data := '{"role": "admin"}'::jsonb
  );

  -- Create regular user (Océane)
  PERFORM auth.create_user(
    uid := gen_random_uuid(),
    email := 'oceane@agence-orbit.ch',
    password := 'oceane123',
    email_confirm := true,
    raw_user_meta_data := '{"role": "user"}'::jsonb
  );
END $$;
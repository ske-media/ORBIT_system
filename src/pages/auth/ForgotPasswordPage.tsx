import React from 'react';
import { supabase } from '../../lib/supabase';
import { Mail } from 'lucide-react';
import { Notification } from '../../components/ui/Notification';
import { useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in the user's metadata
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Aucun compte trouvé avec cette adresse email');
      }
      
      // Update user metadata with the verification code
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { reset_code: code } }
      );
      
      if (updateError) throw updateError;
      
      // Send email with code
      // Note: In production, use a proper email service
      console.log('Code de vérification:', code);
      
      setShowCodeInput(true);
      setSuccess('Un code de vérification a été envoyé à votre adresse email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Verify code and update password
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.user_metadata?.reset_code !== verificationCode) {
        throw new Error('Code de vérification incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          password: newPassword,
          user_metadata: { reset_code: null }
        }
      );

      if (updateError) throw updateError;

      setSuccess('Votre mot de passe a été mis à jour avec succès');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showCodeInput 
              ? 'Entrez le code de vérification reçu par email'
              : 'Entrez votre adresse email pour recevoir un code de vérification'
            }
          </p>
        </div>

        {error && (
          <div className="mt-4">
            <Notification
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {success && (
          <div className="mt-4">
            <Notification
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          </div>
        )}

        {!showCodeInput ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le code'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code de vérification
              </label>
              <input
                type="text"
                id="code"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="123456"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Vérification...
                  </div>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
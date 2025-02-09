import React from 'react';
import { supabase } from '../../lib/supabase';
import { Lock } from 'lucide-react';
import { Notification } from '../../components/ui/Notification';
import { useNavigate, useLocation } from 'react-router-dom';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Vérifier si le token est passé dans l'URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (!token) {
      setError('Le lien de réinitialisation est invalide ou a expiré.');
      return;
    }

    // Ici, vous pouvez également vérifier la validité du token avec supabase.auth.api
    console.log('Token récupéré:', token);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    // Vérifier que le mot de passe est assez long
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setIsLoading(false);
      return;
    }

    try {
      // Appel à Supabase pour réinitialiser le mot de passe
      const { error } = await supabase.auth.api.updateUserPassword(token, password);

      if (error) {
        setError(error.message);
        console.error('Erreur de réinitialisation du mot de passe:', error);
        return;
      }

      setSuccess('Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la connexion...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError('Une erreur est survenue lors de la réinitialisation du mot de passe');
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Entrez votre nouveau mot de passe
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nouveau mot de passe
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mise à jour...
                </div>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
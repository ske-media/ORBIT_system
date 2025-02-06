import React from 'react';
import { UserSettings, UserSettingsFormData } from '../../types/settings';
import { Settings, Moon, Sun } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

export function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<UserSettingsFormData>({
    email: '',
    darkMode: isDarkMode,
  });

  React.useEffect(() => {
    loadUserSettings();
  }, [isDarkMode]);

  const loadUserSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setFormData(prev => ({ ...prev, email: user.email || '' }));

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading settings:', error);
      return;
    }

    // If user has settings, use them
    if (data && data.length > 0) {
      const userSettings = data[0];
      setSettings({
        id: userSettings.id,
        userId: userSettings.user_id,
        darkMode: userSettings.dark_mode,
        createdAt: userSettings.created_at,
        updatedAt: userSettings.updated_at
      });
      setFormData(prev => ({ ...prev, darkMode: userSettings.dark_mode }));
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
      }

      // Update password if provided
      if (formData.currentPassword && formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (passwordError) throw passwordError;
      }

      // Update or create settings using upsert with onConflict
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          dark_mode: formData.darkMode,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (settingsError) throw settingsError;

      setSuccess('Settings updated successfully');
      loadUserSettings(); // Reload settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'darkMode') {
      toggleDarkMode();
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Settings className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={formData.currentPassword || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={formData.newPassword || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="darkMode"
                id="darkMode"
                checked={isDarkMode}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-900">
                Dark Mode
              </label>
            </div>
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-gray-500" />
            ) : (
              <Sun className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
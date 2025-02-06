import React from 'react';
import { supabase } from '../lib/supabase';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Apply theme whenever isDarkMode changes
  React.useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  React.useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_settings')
      .select('dark_mode')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setIsDarkMode(data.dark_mode);
    } else {
      // Create default settings if none exist
      const { data: newSettings, error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            dark_mode: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();
      
      if (!error && newSettings) {
        setIsDarkMode(newSettings.dark_mode);
      } else {
        console.error('Error creating settings:', error);
      }
    }
    setIsLoading(false);
  };

  const applyTheme = (darkMode: boolean) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newDarkMode = !isDarkMode;

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          dark_mode: newDarkMode,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      );

    if (!error) {
      setIsDarkMode(newDarkMode);
    } else {
      console.error('Error updating theme:', error);
    }
  };

  return { isDarkMode, isLoading, toggleDarkMode };
}
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Helper to get user role
export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.role as 'admin' | 'user' | undefined;
};

// Helper to check if user is admin
export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function retryableQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn();
    
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    if (result.error) {
      // If it's a network error and we have retries left
      if (result.error.message?.includes('Failed to fetch') && retries > 0) {
        await sleep(delay);
        return retryableQuery(queryFn, retries - 1, delay * 2);
      }
    }
    
    return result;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('Failed to fetch')) {
      await sleep(delay);
      return retryableQuery(queryFn, retries - 1, delay * 2);
    }
    return { data: null, error };
  }
}
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (client) return client;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error('Supabase URL and Anon Key must be provided as environment variables');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
};

export const supabase = getSupabaseClient();

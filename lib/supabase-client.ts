import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente em vez de hardcoded
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Os valores padrão são mantidos como fallback, mas em produção, use as variáveis de ambiente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adicionando uma função de verificação para diagnóstico
export function checkSupabaseConnection() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Usando variáveis de ambiente:', {
    url: supabaseUrl === process.env.SUPABASE_URL,
    key: supabaseAnonKey === process.env.SUPABASE_ANON_KEY
  });
  
  return supabase.from('activities').select('count', { count: 'exact', head: true });
}
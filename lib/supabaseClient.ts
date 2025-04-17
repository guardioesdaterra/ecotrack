import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente em vez de hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycttxorvsijgagobvqiq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHR4b3J2c2lqZ2Fnb2J2cWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Njc2OTEsImV4cCI6MjA2MDA0MzY5MX0.Jqa7rFw2kZ431ZArIp-A3pHV1GjablWCARV6e19dDbE';

// Os valores padrão são mantidos como fallback, mas em produção, use as variáveis de ambiente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adicionando uma função de verificação para diagnóstico
export function checkSupabaseConnection() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Usando variáveis de ambiente:', {
    url: supabaseUrl === process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: supabaseAnonKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  
  return supabase.from('activities').select('count', { count: 'exact', head: true });
}

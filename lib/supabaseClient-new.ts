import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';

// Usar variáveis de ambiente em vez de hardcoded - tentando ambos os formatos
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Os valores padrão são mantidos como fallback, mas em produção, use as variáveis de ambiente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adicionando uma função de verificação para diagnóstico
export async function checkSupabaseConnection() {
  console.log('Supabase URL:', supabaseUrl ? 'Definido (não exibindo por segurança)' : 'Não definido');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Definido (não exibindo por segurança)' : 'Não definido');
  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('É servidor:', typeof window === 'undefined');
  
  try {
    // Retornar uma promessa para evitar loops infinitos
    const { count, error } = await supabase
      .from('activities')
      .select('count', { count: 'exact', head: true });
    
    return { count, error };
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return { count: 0, error };
  }
} 
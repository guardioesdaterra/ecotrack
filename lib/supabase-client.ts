import { createClient } from '@supabase/supabase-js';

// No ambiente do cliente, apenas as variáveis NEXT_PUBLIC_* estão disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar configuradas'
  );
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para verificar se o cliente Supabase foi inicializado corretamente
export function isSupabaseInitialized(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Função de diagnóstico para verificar a conexão
export async function checkSupabaseConnection() {
  try {
    if (!isSupabaseInitialized()) {
      throw new Error('Cliente Supabase não inicializado corretamente');
    }
    
    const result = await supabase
      .from('activities')
      .select('count', { count: 'exact', head: true });
      
    return {
      success: !result.error,
      status: result.error ? 'error' : 'success',
      error: result.error,
      count: result.count
    };
  } catch (error) {
    return {
      success: false,
      status: 'error',
      error: error instanceof Error ? error : new Error('Erro desconhecido'),
      count: null
    };
  }
}
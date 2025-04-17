import { SupabaseError } from "./types/supabase";

/**
 * Formata detalhes de erro do Supabase para logging estruturado
 */
export function formatSupabaseError(error: unknown): Record<string, unknown> {
  if (!error) {
    return { message: 'Erro desconhecido' };
  }

  // Se for um erro padrão de JavaScript
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }

  // Se for um erro do Supabase
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as SupabaseError;
    return {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback para outros tipos de erro
  return {
    raw: error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Função para logging estruturado de erros
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo: Record<string, unknown> = {}
): void {
  console.error(`Erro em ${context}:`, {
    ...formatSupabaseError(error),
    ...additionalInfo,
  });
}

/**
 * Extrai mensagem amigável de erro para exibição ao usuário
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as SupabaseError;
    return supabaseError.message || 'Erro ao acessar o banco de dados';
  }

  return 'Ocorreu um erro inesperado';
} 
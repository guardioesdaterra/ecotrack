/**
 * Tipos centralizados para entidades do Supabase
 * Usados em toda a aplicação para consistência e type safety
 */

// Modelo de atividade alinhado com o esquema do banco de dados
export interface Activity {
  id: number
  title: string
  type: string
  description?: string
  lat: number
  lng: number
  intensity: number
  created_at: string
  user_id?: string
}

// Modelo de conexão entre atividades
export interface Connection {
  id: number
  from_activity_id: number
  to_activity_id: number
  created_at?: string
}

// Tipos para resposta de erro do Supabase
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
} 
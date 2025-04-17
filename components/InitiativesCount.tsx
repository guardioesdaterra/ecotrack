"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseInitialized } from "@/lib/supabase-client";
import { SupabaseError } from "@/lib/types/supabase";
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-handler";

export function InitiativesCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar inicialização do Supabase
        if (!isSupabaseInitialized()) {
          throw new Error("Cliente Supabase não inicializado");
        }
        
        const { count, error } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true });
        
        if (error) {
          throw error;
        }
        
        setCount(count ?? 0);
      } catch (err) {
        // Usando o manipulador de erros centralizado
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        setCount(null);
        
        // Log estruturado com detalhes completos para diagnóstico
        logError("InitiativesCount.fetchCount", err, {
          component: "InitiativesCount",
          operation: "fetchCount",
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchCount();
  }, []);

  if (loading) return <span className="text-gray-400">...</span>;
  
  if (error) return <span className="text-red-400">{error}</span>;
  
  return <span className="text-xl font-bold text-green-400">{count}</span>;
}

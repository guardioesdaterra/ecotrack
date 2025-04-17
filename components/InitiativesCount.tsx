"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { SupabaseError } from "@/lib/types/supabase";

export function InitiativesCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        setError(null);
        
        const { count, error } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true });
        
        if (error) {
          throw error;
        }
        
        setCount(count ?? 0);
      } catch (err) {
        const supabaseError = err as SupabaseError;
        setError(supabaseError.message || "Erro ao buscar dados");
        setCount(null);
        console.error("Erro ao buscar contagem de atividades:", err);
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

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface InitiativesCountProps {
  staticCount?: number;
}

export function InitiativesCount({ staticCount }: InitiativesCountProps) {
  const [count, setCount] = useState<number | null>(staticCount ?? null);
  const [loading, setLoading] = useState(staticCount === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staticCount !== undefined) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      setCount(staticCount ?? null);
      setLoading(false);
      setError("Conexão não disponível");
      return;
    }

    async function fetchCount() {
      setLoading(true);
      setError(null);
      try {
        const { count, error } = await supabase
          ?.from("initiatives")
          ?.select("*", { count: "exact", head: true }) || {};

        if (error) {
          setError("Erro ao buscar dados");
          setCount(staticCount ?? null);
        } else {
          setCount(count ?? 0);
        }
      } catch (err) {
        setError("Erro de conexão");
        setCount(staticCount ?? null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCount();
  }, [staticCount]);

  if (loading) return <span className="text-gray-400">...</span>;
  if (error) return <span className="text-red-400">{error}</span>;
  return <span className="text-xl font-bold text-green-400">{count}</span>;
}

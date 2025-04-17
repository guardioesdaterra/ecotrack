"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient-new";

export function InitiativesCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      setError(null);
      const { count, error } = await supabase
        .from("initiatives")
        .select("*", { count: "exact", head: true });
      if (error) {
        setError("Erro ao buscar dados");
        setCount(null);
      } else {
        setCount(count ?? 0);
      }
      setLoading(false);
    }
    fetchCount();
  }, []);

  if (loading) return <span className="text-gray-400">...</span>;
  if (error) return <span className="text-red-400">{error}</span>;
  return <span className="text-xl font-bold text-green-400">{count}</span>;
}

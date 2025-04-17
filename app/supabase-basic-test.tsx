"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient-new";
import { Button } from "@/components/ui/button";

export default function SupabaseBasicTest() {
  const [result, setResult] = useState("Clique para testar");
  const [isLoading, setIsLoading] = useState(false);

  async function testConnection() {
    setIsLoading(true);
    setResult("Testando conexão...");

    try {
      // Faz uma consulta simples
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .limit(1);

      if (error) {
        throw error;
      }

      setResult(`Conexão OK! ${data ? data.length : 0} registros encontrados.`);
    } catch (err: any) {
      console.error("Erro:", err);
      setResult(`Erro: ${err.message || "Desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Teste Básico do Supabase</h1>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded mb-4">
        <p className="mb-2">Status: {result}</p>
        <Button 
          onClick={testConnection}
          disabled={isLoading}
        >
          {isLoading ? "Testando..." : "Testar Conexão"}
        </Button>
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl mb-2">Variáveis de Ambiente</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗"}</p>
      </div>
    </div>
  );
} 
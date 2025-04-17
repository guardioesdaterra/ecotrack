"use client";

import { useState } from "react";
import { supabase, checkSupabaseConnection } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";

export default function SupabaseDebugPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testConnection() {
    setIsLoading(true);
    setError(null);


    const connectionResult = await checkSupabaseConnection();
    setResult(connectionResult);

    if (connectionResult.error) {
      setError(connectionResult.error.message);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .limit(1);

      if (error) throw error;

      setResult({
        success: true,
        timestamp: new Date().toISOString(),
        data: data || [],
        count: data ? data.length : 0
      });
    } catch (err: any) {
      console.error("Erro:", err);
      setError(err.message || "Erro desconhecido");
      setResult({
        success: false,
        timestamp: new Date().toISOString(),
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug do Supabase</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Teste de Conexão</h2>
          <Button onClick={testConnection} disabled={isLoading}>
            {isLoading ? "Testando..." : "Testar Agora"}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        
        {result && (
          <pre className="bg-gray-200 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4">Variáveis de Ambiente (Cliente)</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Definido" : "✗ Não definido"}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Definido" : "✗ Não definido"}</p>
      </div>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DirectTestPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testDirectFetch() {
    setIsLoading(true);
    setError(null);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError("Variáveis de ambiente não definidas");
      setIsLoading(false);
      return;
    }
    
    try {
      // Configura um timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Faz uma requisição direta para a API do Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/activities?select=id&limit=1`, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      setResult({
        success: true,
        statusCode: response.status,
        data,
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Erro na requisição direta:", err);
      setError(err.name === 'AbortError' 
        ? 'Timeout na conexão (5 segundos)' 
        : `Erro: ${err.message}`);
      
      setResult({
        success: false,
        error: err.message,
        isTimeout: err.name === 'AbortError',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste Direto da API Supabase</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Este teste usa fetch diretamente, sem o cliente Supabase
          </p>
          <Button onClick={testDirectFetch} disabled={isLoading}>
            {isLoading ? "Testando..." : "Testar API Diretamente"}
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
        <h2 className="text-xl mb-4">Configuração</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 
          "✗ Não definido"}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          "✓ Definido (ocultado por segurança)" : 
          "✗ Não definido"}</p>
      </div>
    </div>
  );
} 
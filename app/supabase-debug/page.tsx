"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient-new";
import { Button } from "@/components/ui/button";

// Define proper types
interface DbTestResult {
  success: boolean;
  error: any | null;
  count: number | null;
}

interface EnvCheckResult {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  environment: string | undefined;
  isClient: boolean;
  vercelEnv: string;
}

interface DebugData {
  timestamp: string;
  environment: EnvCheckResult;
  dbTest: DbTestResult;
}

export default function SupabaseDebugPage() {
  const [debug, setDebug] = useState<DebugData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function runDiagnostics() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check environment variables
      const envCheck: EnvCheckResult = {
        supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        supabaseAnonKey: 
          process.env.SUPABASE_ANON_KEY || 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          "***presente***" : null,
        environment: process.env.NODE_ENV,
        isClient: typeof window !== 'undefined',
        vercelEnv: process.env.VERCEL_ENV || 'local'
      };
      
      // Try to fetch data
      let dbTest: DbTestResult = { success: false, error: null, count: null };
      try {
        const { count, error } = await supabase
          .from('activities')
          .select('count', { count: 'exact', head: true });
          
        if (error) throw error;
        
        dbTest = { 
          success: true, 
          error: null, 
          count: count 
        };
      } catch (err: any) {
        dbTest = { 
          success: false, 
          error: err.message || String(err), 
          count: null 
        };
      }
      
      // Set debug information
      setDebug({
        timestamp: new Date().toISOString(),
        environment: envCheck,
        dbTest
      });
    } catch (err: any) {
      setError(err.message || "Erro desconhecido durante o diagnóstico");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug</h1>
      
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Diagnóstico do Supabase</h2>
            <Button 
              onClick={runDiagnostics}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Executando..." : "Executar novamente"}
            </Button>
          </div>
          
          {error ? (
            <div className="p-4 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <pre className="p-4 bg-gray-200 dark:bg-gray-900 rounded overflow-auto text-sm font-mono">
              {JSON.stringify(debug, null, 2)}
            </pre>
          )}
        </div>
        
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Soluções Comuns</h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded bg-cyan-100 dark:bg-cyan-900/30">
              <h3 className="font-medium text-cyan-800 dark:text-cyan-300">Definir Variáveis de Ambiente</h3>
              <p className="text-sm mt-1">
                Certifique-se de que as variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão definidas em .env.local (desenvolvimento) 
                e nas Variáveis de Ambiente do Vercel (produção).
              </p>
            </div>
            
            <div className="p-3 rounded bg-purple-100 dark:bg-purple-900/30">
              <h3 className="font-medium text-purple-800 dark:text-purple-300">Acesso Client vs Server</h3>
              <p className="text-sm mt-1">
                Use SUPABASE_URL para acesso em Server Components e NEXT_PUBLIC_SUPABASE_URL para Client Components.
                O mesmo se aplica para SUPABASE_ANON_KEY vs NEXT_PUBLIC_SUPABASE_ANON_KEY.
              </p>
            </div>
            
            <div className="p-3 rounded bg-emerald-100 dark:bg-emerald-900/30">
              <h3 className="font-medium text-emerald-800 dark:text-emerald-300">Verificar URLs</h3>
              <p className="text-sm mt-1">
                Certifique-se de que a URL do Supabase está correta e acessível a partir do ambiente de implantação.
                Teste o acesso direto via um navegador para confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
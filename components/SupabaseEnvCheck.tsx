"use client";

import { useEffect, useState } from 'react';
import { checkSupabaseConnection, isSupabaseInitialized } from '@/lib/supabase-client';
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Button } from '@/components/ui/button';

export function SupabaseEnvCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando conexão com o Supabase...');
  const [details, setDetails] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  async function checkConnection() {
    try {
      setStatus('loading');
      setMessage('Verificando conexão com o Supabase...');
      setHasChecked(true);
      
      // Verificar se as variáveis de ambiente estão definidas e o cliente inicializado
      if (!isSupabaseInitialized()) {
        setStatus('error');
        setMessage("Cliente Supabase não inicializado. Verifique as variáveis de ambiente.");
        setDetails({
          message: "O cliente Supabase não está inicializado corretamente",
          hint: "Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
          environment: process.env.NODE_ENV
        });
        return;
      }
      
      const result = await checkSupabaseConnection();
      
      if (!result.success) {
        setStatus('error');
        setMessage(`Erro ao conectar com o Supabase: ${getUserFriendlyErrorMessage(result.error)}`);
        
        // Log estruturado do erro
        logError('SupabaseEnvCheck.checkConnection', result.error, {
          component: 'SupabaseEnvCheck',
          operation: 'checkConnection',
          timestamp: new Date().toISOString()
        });
        
        setDetails({
          error: result.error,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        });
        return;
      }
      
      setStatus('success');
      setMessage(`Conexão com o Supabase estabelecida com sucesso! Encontramos ${result.count} atividades.`);
      setDetails({
        success: true,
        count: result.count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setStatus('error');
      
      const errorMessage = getUserFriendlyErrorMessage(error);
      setMessage(`Erro ao verificar conexão: ${errorMessage}`);
      
      // Log estruturado do erro
      logError('SupabaseEnvCheck.checkConnection', error, {
        component: 'SupabaseEnvCheck',
        operation: 'checkConnection',
        timestamp: new Date().toISOString()
      });
      
      setDetails({
        error: error,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    }
  }

  useEffect(() => {
    // Prevent multiple calls
    if (hasChecked) return;
    
    checkConnection();
  }, [hasChecked]);

  const bgColor = status === 'loading' 
    ? 'bg-yellow-100 dark:bg-yellow-900/30' 
    : status === 'success' 
      ? 'bg-green-100 dark:bg-green-900/30' 
      : 'bg-red-100 dark:bg-red-900/30';
      
  const textColor = status === 'loading' 
    ? 'text-yellow-800 dark:text-yellow-200' 
    : status === 'success' 
      ? 'text-green-800 dark:text-green-200' 
      : 'text-red-800 dark:text-red-200';

  return (
    <div className={`p-4 mb-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-center">
        {status === 'loading' && (
          <div className="mr-2 animate-spin h-5 w-5 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
        )}
        {status === 'success' && (
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
        )}
        <h3 className={`text-lg font-medium ${textColor}`}>Status da Conexão Supabase</h3>
      </div>
      <div className={`mt-2 ${textColor}`}>
        <p>{message}</p>
        
        <div className="flex gap-2 mt-4">
          {status === 'error' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkConnection}
              className="text-xs"
            >
              Tentar Novamente
            </Button>
          )}
          
          {details && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
            </Button>
          )}
        </div>
        
        {showDetails && details && (
          <pre className="mt-2 p-2 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-5 rounded text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
} 
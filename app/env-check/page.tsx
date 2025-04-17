import { SupabaseEnvCheck } from "@/components/SupabaseEnvCheck";

export default function EnvCheckPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Verificação de Variáveis de Ambiente</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Conexão com o Supabase</h2>
        <SupabaseEnvCheck />
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Informações de Ambiente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Ambiente</h3>
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
            <p>VERCEL_ENV: {process.env.VERCEL_ENV || 'não definido'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Variáveis Públicas do Supabase</h3>
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ definido' : '❌ não definido'}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ definido' : '❌ não definido'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instruções para Configurar Variáveis no Vercel</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Acesse o painel do Vercel e selecione seu projeto</li>
          <li>Navegue até a seção <strong>Settings</strong> (Configurações)</li>
          <li>Clique em <strong>Environment Variables</strong> (Variáveis de Ambiente)</li>
          <li>Adicione as seguintes variáveis:
            <ul className="list-disc pl-5 mt-2">
              <li><code>NEXT_PUBLIC_SUPABASE_URL</code>: URL do seu projeto no Supabase</li>
              <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>: Chave anônima do seu projeto no Supabase</li>
            </ul>
          </li>
          <li>Clique em <strong>Save</strong> (Salvar)</li>
          <li>Faça um novo deploy do seu projeto</li>
        </ol>
      </div>
    </div>
  );
} 
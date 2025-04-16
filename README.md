# EarthTrack Global - Deploy no GitHub Pages

## Pré-requisitos
- Conta no GitHub
- Node.js 20+ instalado
- Git instalado

## Passos para deploy

1. **Crie um repositório no GitHub**
   - Vá para https://github.com/new
   - Dê um nome ao repositório (ex: earthtrack-global)
   - Selecione "Public" ou "Private" conforme necessário

2. **Configure o repositório local**
```bash
git init
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
```

3. **Primeiro push**
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

4. **Configure o GitHub Pages**
   - Vá para Settings > Pages no seu repositório
   - Em "Source", selecione "GitHub Actions"
   - Em "Branch", selecione "gh-pages" e "/ (root)"

5. **Monitorando o deploy**
   - O workflow será acionado automaticamente após cada push
   - Verifique o progresso em Actions > Deploy to GitHub Pages
   - Quando completo, seu site estará disponível em:
     `https://seu-usuario.github.io/seu-repositorio`

## Desenvolvimento local
```bash
npm install
npm run dev
```

## Build para produção
```bash
npm run deploy
```

## Configuração de Segurança

Para configurar as chaves do Supabase:

1. Acesse: https://github.com/guardioesdaterra/ecotrack/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione:
   - Nome: SUPABASE_URL
   - Valor: sua URL do Supabase
4. Clique em "New repository secret" novamente
5. Adicione:
   - Nome: SUPABASE_KEY
   - Valor: sua chave pública do Supabase

## Tecnologias utilizadas
- Next.js 15
- React 19
- Tailwind CSS
- Supabase

## Fluxo de Deploy
1. `npm run deploy` gera os arquivos estáticos na pasta /out
2. GitHub Actions publica automaticamente na branch gh-pages
3. GitHub Pages serve o conteúdo estático

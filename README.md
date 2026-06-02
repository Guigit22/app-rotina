# 🗓️ Planejador de Rotina Diária

Aplicativo web completo para organizar tarefas, construir hábitos e acompanhar sua produtividade.

**Stack:** React + Vite + TypeScript · Tailwind CSS · componentes no estilo **Shadcn/ui** · **Supabase** (Auth + Postgres) · **Recharts** · Deploy na **Vercel**.

> 💡 **Modo demonstração:** se as variáveis do Supabase não estiverem configuradas, o app funciona automaticamente com armazenamento local (localStorage), permitindo testar todas as telas sem backend. Ao preencher o `.env` com credenciais válidas, ele passa a usar o Supabase real.

---

## ✨ Funcionalidades

- 🔐 Login, cadastro, recuperação de senha e proteção de rotas (Supabase Auth)
- 📊 Dashboard com resumo diário (tarefas e hábitos)
- ✅ CRUD completo de tarefas com filtros, busca, tabela e mudança de status
- 🔁 CRUD completo de hábitos com sistema de **streaks** e recordes (celebração ao bater recorde)
- 📅 Calendário mensal interativo com indicadores por dia
- 📈 Estatísticas com gráficos de pizza, barras e linha
- 🔔 Notificações de lembrete no navegador
- 🌙 Modo escuro persistido no localStorage
- 📱 Totalmente responsivo (mobile e desktop)

---

## 🚀 Como rodar localmente

```bash
npm install
cp .env.example .env   # preencha com suas credenciais do Supabase
npm run dev
```

Acesse `http://localhost:5173`.

---

## 🔧 Variáveis de ambiente (`.env`)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_key_aqui
VITE_APP_NAME=PlanejadorDeRotina
VITE_APP_URL=http://localhost:5173
```

Encontre `URL` e `anon key` em **Supabase → Project Settings → API**.

---

## 🗄️ Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   - Cria as tabelas `tasks`, `habits` e `habit_logs`.
   - Habilita **RLS** e cria políticas garantindo que cada usuário acesse apenas seus próprios dados.
3. (Opcional) Em **Authentication → Providers → Email**, desabilite "Confirm email" para login imediato após o cadastro durante o desenvolvimento.

---

## 🌳 Git — commits semânticos

```bash
git init
git add .
git commit -m "feat: configuração inicial do projeto com Vite e React"
git commit --allow-empty -m "feat: implementação de autenticação com Supabase"
git commit --allow-empty -m "feat: criação da tela de login e cadastro"
git commit --allow-empty -m "feat: implementação do dashboard com resumos"
git commit --allow-empty -m "feat: CRUD completo de tarefas"
git commit --allow-empty -m "feat: CRUD completo de hábitos"
git commit --allow-empty -m "feat: implementação do calendário interativo"
git commit --allow-empty -m "feat: sistema de streaks e progresso"
git commit --allow-empty -m "feat: gráficos e estatísticas"
git commit --allow-empty -m "feat: responsividade mobile completa"
git commit --allow-empty -m "feat: sistema de notificações e lembretes"
git commit --allow-empty -m "fix: correções de bugs e validações"
```

---

## 🐙 Publicar no GitHub

```bash
# crie um repositório vazio no GitHub (sem README) e então:
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/planejador-de-rotina.git
git push -u origin main
```

---

## ▲ Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New → Project** e importe o repositório do GitHub.
2. Framework Preset: **Vite** (detectado automaticamente).
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Em **Settings → Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME`
   - `VITE_APP_URL` (use a URL final da Vercel, ex.: `https://seu-app.vercel.app`)
4. Clique em **Deploy**.
5. No Supabase, em **Authentication → URL Configuration**, adicione a URL da Vercel em *Site URL* e *Redirect URLs* (para a recuperação de senha funcionar em produção).

Pronto! ✅

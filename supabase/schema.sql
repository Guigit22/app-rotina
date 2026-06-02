-- ============================================================
-- Planejador de Rotina Diária — Esquema do Banco de Dados
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

-- Habilita a extensão necessária para uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== TABELA: tasks =====================
CREATE TABLE IF NOT EXISTS public.tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  category      VARCHAR(100) NOT NULL,
  priority      VARCHAR(20) NOT NULL CHECK (priority IN ('alta', 'media', 'baixa')),
  status        VARCHAR(20) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  reminder      BOOLEAN DEFAULT false,
  reminder_time TIME,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ===================== TABELA: habits =====================
CREATE TABLE IF NOT EXISTS public.habits (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  category       VARCHAR(100) NOT NULL,
  frequency      VARCHAR(20) NOT NULL
                 CHECK (frequency IN ('diario', 'semanal', 'dias_alternados', 'personalizado')),
  days_of_week   TEXT,
  target_count   INTEGER NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak    INTEGER DEFAULT 0,
  color          VARCHAR(7) DEFAULT '#3B82F6',
  icon           VARCHAR(50) DEFAULT 'star',
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ===================== TABELA: habit_logs =====================
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id       UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at   TIMESTAMP DEFAULT NOW(),
  notes          TEXT
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_tasks_user_date  ON public.tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habits_user      ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_habit  ON public.habit_logs(user_id, habit_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário só acessa os próprios registros
CREATE POLICY "tasks_owner_all" ON public.tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_owner_all" ON public.habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_logs_owner_all" ON public.habit_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

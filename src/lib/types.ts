export type Priority = "alta" | "media" | "baixa";
export type TaskStatus = "pendente" | "em_andamento" | "concluida";
export type Frequency = "diario" | "semanal" | "dias_alternados" | "personalizado";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: Priority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  reminder: boolean;
  reminder_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: Frequency;
  days_of_week: string | null;
  target_count: number;
  current_streak: number;
  best_streak: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD
  completed_at: string;
  notes: string | null;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export const TASK_CATEGORIES = ["Trabalho", "Estudos", "Saúde", "Lazer", "Pessoal", "Casa", "Financeiro", "Outros"];
export const HABIT_CATEGORIES = ["Saúde", "Produtividade", "Aprendizado", "Bem-estar", "Financeiro", "Social", "Outros"];
export const HABIT_ICONS = ["⭐", "💧", "🏃", "📚", "🧘", "💪", "🥗", "😴", "💰", "🎯", "🎨", "🎵"];
export const WEEK_DAYS = [
  { key: "dom", label: "Dom" },
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
];

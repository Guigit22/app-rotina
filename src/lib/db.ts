import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { Task, Habit, HabitLog } from "./types";

// ---------- Local demo storage helpers ----------
function lsGet<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function lsSet<T>(key: string, val: T[]) {
  localStorage.setItem(key, JSON.stringify(val));
}
function uid() {
  return crypto.randomUUID();
}
const TKEY = (u: string) => `pr_tasks_${u}`;
const HKEY = (u: string) => `pr_habits_${u}`;
const LKEY = (u: string) => `pr_logs_${u}`;

// ======================= TASKS =======================
export async function getTasks(userId: string): Promise<Task[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) throw error;
    return (data as Task[]) || [];
  }
  return lsGet<Task>(TKEY(userId)).sort((a, b) =>
    (a.date + a.start_time).localeCompare(b.date + b.start_time)
  );
}

export async function createTask(
  userId: string,
  payload: Omit<Task, "id" | "user_id" | "created_at" | "updated_at" | "status"> & { status?: Task["status"] }
): Promise<Task> {
  const now = new Date().toISOString();
  const row: Task = {
    id: uid(),
    user_id: userId,
    status: payload.status ?? "pendente",
    created_at: now,
    updated_at: now,
    ...payload,
  } as Task;
  if (isSupabaseConfigured && supabase) {
    const { id, created_at, updated_at, ...insert } = row;
    void id; void created_at; void updated_at;
    const { data, error } = await supabase.from("tasks").insert(insert).select().single();
    if (error) throw error;
    return data as Task;
  }
  const all = lsGet<Task>(TKEY(userId));
  all.push(row);
  lsSet(TKEY(userId), all);
  return row;
}

export async function updateTask(userId: string, id: string, patch: Partial<Task>): Promise<Task> {
  const updated_at = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...patch, updated_at })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }
  const all = lsGet<Task>(TKEY(userId));
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Tarefa não encontrada");
  all[idx] = { ...all[idx], ...patch, updated_at };
  lsSet(TKEY(userId), all);
  return all[idx];
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
    return;
  }
  lsSet(TKEY(userId), lsGet<Task>(TKEY(userId)).filter((t) => t.id !== id));
}

// ======================= HABITS =======================
export async function getHabits(userId: string): Promise<Habit[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Habit[]) || [];
  }
  return lsGet<Habit>(HKEY(userId)).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createHabit(
  userId: string,
  payload: Omit<Habit, "id" | "user_id" | "created_at" | "current_streak" | "best_streak" | "is_active">
): Promise<Habit> {
  const row: Habit = {
    id: uid(),
    user_id: userId,
    current_streak: 0,
    best_streak: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    ...payload,
  };
  if (isSupabaseConfigured && supabase) {
    const { id, created_at, ...insert } = row;
    void id; void created_at;
    const { data, error } = await supabase.from("habits").insert(insert).select().single();
    if (error) throw error;
    return data as Habit;
  }
  const all = lsGet<Habit>(HKEY(userId));
  all.push(row);
  lsSet(HKEY(userId), all);
  return row;
}

export async function updateHabit(userId: string, id: string, patch: Partial<Habit>): Promise<Habit> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("habits")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Habit;
  }
  const all = lsGet<Habit>(HKEY(userId));
  const idx = all.findIndex((h) => h.id === id);
  if (idx === -1) throw new Error("Hábito não encontrado");
  all[idx] = { ...all[idx], ...patch };
  lsSet(HKEY(userId), all);
  return all[idx];
}

export async function deleteHabit(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from("habit_logs").delete().eq("habit_id", id).eq("user_id", userId);
    const { error } = await supabase.from("habits").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
    return;
  }
  lsSet(HKEY(userId), lsGet<Habit>(HKEY(userId)).filter((h) => h.id !== id));
  lsSet(LKEY(userId), lsGet<HabitLog>(LKEY(userId)).filter((l) => l.habit_id !== id));
}

// ======================= HABIT LOGS =======================
export async function getHabitLogs(userId: string): Promise<HabitLog[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("habit_logs").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data as HabitLog[]) || [];
  }
  return lsGet<HabitLog>(LKEY(userId));
}

export async function addHabitLog(userId: string, habitId: string, date: string): Promise<HabitLog> {
  const row: HabitLog = {
    id: uid(),
    habit_id: habitId,
    user_id: userId,
    completed_date: date,
    completed_at: new Date().toISOString(),
    notes: null,
  };
  if (isSupabaseConfigured && supabase) {
    const { id, completed_at, ...insert } = row;
    void id; void completed_at;
    const { data, error } = await supabase.from("habit_logs").insert(insert).select().single();
    if (error) throw error;
    return data as HabitLog;
  }
  const all = lsGet<HabitLog>(LKEY(userId));
  all.push(row);
  lsSet(LKEY(userId), all);
  return row;
}

export async function removeHabitLog(userId: string, habitId: string, date: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("completed_date", date);
    if (error) throw error;
    return;
  }
  lsSet(
    LKEY(userId),
    lsGet<HabitLog>(LKEY(userId)).filter((l) => !(l.habit_id === habitId && l.completed_date === date))
  );
}

/** Calculate consecutive-day streak ending today from a set of completed dates. */
export function calcStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  // allow today not done yet -> still count from yesterday
  if (!set.has(toISODate(d))) d.setDate(d.getDate() - 1);
  while (set.has(toISODate(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

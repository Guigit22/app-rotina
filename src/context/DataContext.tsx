import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import * as db from "@/lib/db";
import { calcStreak } from "@/lib/db";
import type { Task, Habit, HabitLog } from "@/lib/types";

interface ToggleResult {
  completed: boolean;
  newRecord: boolean;
}

interface DataContextValue {
  tasks: Task[];
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  refresh: () => Promise<void>;
  addTask: (p: Parameters<typeof db.createTask>[1]) => Promise<Task>;
  editTask: (id: string, patch: Partial<Task>) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
  addHabit: (p: Parameters<typeof db.createHabit>[1]) => Promise<Habit>;
  editHabit: (id: string, patch: Partial<Habit>) => Promise<Habit>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<ToggleResult>;
  isHabitDone: (habitId: string, date: string) => boolean;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [t, h, l] = await Promise.all([
        db.getTasks(user.id),
        db.getHabits(user.id),
        db.getHabitLogs(user.id),
      ]);
      setTasks(t);
      setHabits(h);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else {
      setTasks([]);
      setHabits([]);
      setLogs([]);
    }
  }, [user, refresh]);

  const addTask: DataContextValue["addTask"] = async (p) => {
    const t = await db.createTask(user!.id, p);
    setTasks((prev) => [...prev, t]);
    return t;
  };
  const editTask: DataContextValue["editTask"] = async (id, patch) => {
    const t = await db.updateTask(user!.id, id, patch);
    setTasks((prev) => prev.map((x) => (x.id === id ? t : x)));
    return t;
  };
  const removeTask: DataContextValue["removeTask"] = async (id) => {
    await db.deleteTask(user!.id, id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
  };

  const addHabit: DataContextValue["addHabit"] = async (p) => {
    const h = await db.createHabit(user!.id, p);
    setHabits((prev) => [h, ...prev]);
    return h;
  };
  const editHabit: DataContextValue["editHabit"] = async (id, patch) => {
    const h = await db.updateHabit(user!.id, id, patch);
    setHabits((prev) => prev.map((x) => (x.id === id ? h : x)));
    return h;
  };
  const removeHabit: DataContextValue["removeHabit"] = async (id) => {
    await db.deleteHabit(user!.id, id);
    setHabits((prev) => prev.filter((x) => x.id !== id));
    setLogs((prev) => prev.filter((l) => l.habit_id !== id));
  };

  const isHabitDone = useCallback(
    (habitId: string, date: string) =>
      logs.some((l) => l.habit_id === habitId && l.completed_date === date),
    [logs]
  );

  const toggleHabit: DataContextValue["toggleHabit"] = async (habitId, date) => {
    const done = logs.some((l) => l.habit_id === habitId && l.completed_date === date);
    let newLogs: HabitLog[];
    if (done) {
      await db.removeHabitLog(user!.id, habitId, date);
      newLogs = logs.filter((l) => !(l.habit_id === habitId && l.completed_date === date));
    } else {
      const log = await db.addHabitLog(user!.id, habitId, date);
      newLogs = [...logs, log];
    }
    setLogs(newLogs);

    // recompute streak
    const dates = newLogs.filter((l) => l.habit_id === habitId).map((l) => l.completed_date);
    const current = calcStreak(dates);
    const habit = habits.find((h) => h.id === habitId)!;
    const best = Math.max(habit.best_streak, current);
    const newRecord = !done && current > habit.best_streak && current > 0;
    const updated = await db.updateHabit(user!.id, habitId, { current_streak: current, best_streak: best });
    setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));

    return { completed: !done, newRecord };
  };

  return (
    <DataContext.Provider
      value={{
        tasks, habits, logs, loading, refresh,
        addTask, editTask, removeTask,
        addHabit, editHabit, removeHabit,
        toggleHabit, isHabitDone,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

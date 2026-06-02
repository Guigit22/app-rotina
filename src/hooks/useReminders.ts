import { useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";

/**
 * Checks every 30s for tasks whose reminder_time matches the current time
 * and fires a browser notification (requesting permission once).
 */
export function useReminders() {
  const { tasks } = useData();
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const now = new Date();
      const todayIso = toISODate(now);
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      tasks.forEach((t) => {
        if (
          t.reminder &&
          t.reminder_time === hhmm &&
          t.date === todayIso &&
          t.status !== "concluida" &&
          !fired.current.has(t.id + hhmm)
        ) {
          fired.current.add(t.id + hhmm);
          new Notification("⏰ Lembrete de tarefa", {
            body: `${t.title} — ${t.start_time}`,
          });
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks]);
}

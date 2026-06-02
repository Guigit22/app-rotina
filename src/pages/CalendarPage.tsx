import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Plus, Calendar as CalIcon, Check, Pencil, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";
import { monthLabel, formatLongDate, priorityColor, statusBadgeClass, statusLabel } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TaskDialog from "@/components/TaskDialog";
import type { Task } from "@/lib/types";
import { toast } from "@/components/ui/sonner";

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarPage() {
  const { tasks, habits, editTask, removeTask, toggleHabit, isHabitDone } = useData();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string>(toISODate(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const today = toISODate(new Date());

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [cursor]);

  const activeHabits = habits.filter((h) => h.is_active);

  function tasksFor(iso: string) {
    return tasks.filter((t) => t.date === iso).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }
  function allHabitsDone(iso: string) {
    return activeHabits.length > 0 && activeHabits.every((h) => isHabitDone(h.id, iso));
  }

  const selTasks = tasksFor(selected);

  async function complete(t: Task) {
    try { await editTask(t.id, { status: "concluida" }); toast.success("Tarefa concluída!"); }
    catch { toast.error("Erro."); }
  }
  async function del(t: Task) {
    try { await removeTask(t.id); toast.success("Tarefa excluída!"); }
    catch { toast.error("Erro."); }
  }
  async function onToggleHabit(id: string) {
    try {
      const res = await toggleHabit(id, selected);
      if (res.newRecord) toast.success("🎉 Novo recorde!");
    } catch { toast.error("Erro."); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CalIcon className="h-6 w-6" /> Calendário</h2>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="w-full sm:w-auto">
          <Plus /> Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="capitalize">{monthLabel(cursor)}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setCursor(new Date()); setSelected(today); }}>Hoje</Button>
              <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WD.map((d) => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((iso, i) => {
                if (!iso) return <div key={i} />;
                const dayTasks = tasksFor(iso);
                const isToday = iso === today;
                const isSel = iso === selected;
                const habitsComplete = allHabitsDone(iso);
                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(iso)}
                    className={`relative aspect-square rounded-lg border p-1 text-left transition-colors hover:bg-accent
                      ${isSel ? "ring-2 ring-primary" : ""} ${isToday ? "bg-primary/10 border-primary/40" : "bg-background"}`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isToday ? "text-primary" : ""}`}>{Number(iso.slice(-2))}</span>
                    {habitsComplete && <Star className="absolute top-1 right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {dayTasks.slice(0, 4).map((t) => (
                        <span key={t.id} className="h-1.5 w-1.5 rounded-full" style={{ background: priorityColor[t.priority] }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base capitalize">{formatLongDate(new Date(selected + "T00:00:00"))}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Tarefas</h4>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selTasks.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma tarefa neste dia.</p>}
              <div className="space-y-2">
                {selTasks.map((t) => (
                  <div key={t.id} className={`rounded-lg border p-2.5 ${t.status === "concluida" ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${t.status === "concluida" ? "line-through" : ""}`}>{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.start_time}–{t.end_time}</p>
                        <Badge className={`${statusBadgeClass[t.status]} mt-1 text-[10px]`}>{statusLabel[t.status]}</Badge>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {t.status !== "concluida" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => complete(t)}><Check className="h-3.5 w-3.5 text-green-600" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(t); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => del(t)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Hábitos</h4>
              {activeHabits.length === 0 && <p className="text-xs text-muted-foreground">Nenhum hábito ativo.</p>}
              <div className="space-y-2">
                {activeHabits.map((h) => {
                  const done = isHabitDone(h.id, selected);
                  return (
                    <label key={h.id} className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer">
                      <Checkbox checked={done} onCheckedChange={() => onToggleHabit(h.id)} />
                      <span>{h.icon}</span>
                      <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{h.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} defaultDate={selected} />
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, CheckCircle2, Clock, Star, ArrowRight, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";
import { priorityColor, priorityLabel, priorityBadgeClass, statusLabel, statusBadgeClass } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, habits, toggleHabit, isHabitDone } = useData();
  const navigate = useNavigate();
  const today = toISODate(new Date());

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.date === today).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [tasks, today]
  );
  const done = todayTasks.filter((t) => t.status === "concluida").length;
  const pending = todayTasks.filter((t) => t.status !== "concluida").length;
  const activeHabits = habits.filter((h) => h.is_active);
  const habitsDone = activeHabits.filter((h) => isHabitDone(h.id, today)).length;

  async function onToggleHabit(id: string) {
    try {
      const res = await toggleHabit(id, today);
      if (res.newRecord) toast.success("🎉 Novo recorde de sequência!");
      else if (res.completed) toast.success("Hábito concluído!");
    } catch {
      toast.error("Erro ao atualizar hábito.");
    }
  }

  const cards = [
    { label: "Tarefas de hoje", value: todayTasks.length, icon: ListChecks, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/40" },
    { label: "Concluídas", value: done, icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-950/40" },
    { label: "Pendentes", value: pending, icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40" },
    { label: "Hábitos hoje", value: `${habitsDone}/${activeHabits.length}`, icon: Star, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950/40" },
  ];

  const upcoming = todayTasks.filter((t) => t.status !== "concluida").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Olá, {user?.name}</h2>
        <p className="text-sm md:text-base text-muted-foreground">Aqui está seu resumo de hoje</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className={`h-10 w-10 md:h-11 md:w-11 rounded-lg flex items-center justify-center ${c.color}`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold leading-none">{c.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <CardTitle className="text-base md:text-lg">Próximas Tarefas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tarefas")} className="w-full sm:w-auto">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma tarefa pendente para hoje. 🎉</p>
            )}
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3 flex-col sm:flex-row">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: priorityColor[t.priority] }} />
                <div className="min-w-0 flex-1 w-full">
                  <p className="text-sm md:text-base font-medium truncate">{t.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t.start_time} - {t.end_time}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={statusBadgeClass[t.status]}>{statusLabel[t.status]}</Badge>
                  <span className={`text-[10px] px-1.5 rounded ${priorityBadgeClass[t.priority]}`}>{priorityLabel[t.priority]}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <CardTitle className="text-base md:text-lg">Hábitos de Hoje</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/habitos")} className="w-full sm:w-auto">
              Gerenciar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeHabits.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Você ainda não tem hábitos. Crie um!</p>
            )}
            {activeHabits.map((h) => {
              const checked = isHabitDone(h.id, today);
              return (
                <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3 flex-col sm:flex-row">
                  <Checkbox checked={checked} onCheckedChange={() => onToggleHabit(h.id)} />
                  <span className="text-lg md:text-xl">{h.icon}</span>
                  <div className="min-w-0 flex-1 w-full">
                    <p className={`text-sm md:text-base font-medium truncate ${checked ? "line-through text-muted-foreground" : ""}`}>{h.name}</p>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                      <Flame className="h-3 w-3 text-orange-500" /> {h.current_streak} dias
                    </div>
                  </div>
                </div>
              );
            })}
            {activeHabits.length > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-1">
                  <span>Progresso de hoje</span>
                  <span>{habitsDone}/{activeHabits.length}</span>
                </div>
                <Progress value={activeHabits.length ? (habitsDone / activeHabits.length) * 100 : 0} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

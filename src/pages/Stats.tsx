import { useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, CheckCircle2, Repeat } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Stats() {
  const { tasks, habits, logs } = useData();

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => { map[t.category] = (map[t.category] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const byWeekday = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    tasks.filter((t) => t.status === "concluida").forEach((t) => {
      const d = new Date(t.date + "T00:00:00");
      counts[d.getDay()]++;
    });
    return WD.map((day, i) => ({ day, concluidas: counts[i] }));
  }, [tasks]);

  const streakEvolution = useMemo(() => {
    // last 14 days: number of habit completions per day
    const days: { date: string; conclusoes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      days.push({
        date: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
        conclusoes: logs.filter((l) => l.completed_date === iso).length,
      });
    }
    return days;
  }, [logs]);

  const taskRate = tasks.length ? Math.round((tasks.filter((t) => t.status === "concluida").length / tasks.length) * 100) : 0;
  const totalBest = habits.reduce((s, h) => s + h.best_streak, 0);
  const activeCount = habits.filter((h) => h.is_active).length;

  const summary = [
    { label: "Taxa de conclusão", value: `${taskRate}%`, icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-950/40" },
    { label: "Total de tarefas", value: tasks.length, icon: BarChart3, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/40" },
    { label: "Hábitos ativos", value: activeCount, icon: Repeat, color: "text-violet-600 bg-violet-100 dark:bg-violet-950/40" },
    { label: "Recordes somados", value: totalBest, icon: TrendingUp, color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" /> Estatísticas</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${s.color}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Tarefas por Categoria</CardTitle></CardHeader>
          <CardContent>
            {byCategory.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tarefas Concluídas por Dia da Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byWeekday}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="concluidas" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Evolução dos Hábitos (últimos 14 dias)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={streakEvolution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="conclusoes" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Sem dados ainda.</div>;
}

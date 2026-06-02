import { useEffect, useState } from "react";
import { Plus, Flame, Trophy, Check, MoreVertical, Pencil, Trash2, Pause, Play, Loader2, AlertCircle, Repeat } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";
import { HABIT_CATEGORIES, HABIT_ICONS, WEEK_DAYS } from "@/lib/types";
import type { Habit, Frequency } from "@/lib/types";
import { frequencyLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

const emptyForm = {
  name: "", description: "", category: "", frequency: "" as Frequency | "",
  days_of_week: [] as string[], target_count: 1, color: "#6366f1", icon: "⭐",
};

export default function Habits() {
  const { habits, logs, addHabit, editHabit, removeHabit, toggleHabit, isHabitDone } = useData();
  const today = toISODate(new Date());

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [celebrating, setCelebrating] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError("");
      if (editing) {
        setForm({
          name: editing.name, description: editing.description || "", category: editing.category,
          frequency: editing.frequency, days_of_week: editing.days_of_week ? editing.days_of_week.split(",") : [],
          target_count: editing.target_count, color: editing.color, icon: editing.icon,
        });
      } else setForm(emptyForm);
    }
  }, [open, editing]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleDay(d: string) {
    setForm((p) => ({
      ...p,
      days_of_week: p.days_of_week.includes(d) ? p.days_of_week.filter((x) => x !== d) : [...p.days_of_week, d],
    }));
  }

  function validate(): string {
    if (!form.name.trim()) return "O nome do hábito é obrigatório.";
    if (!form.category) return "A categoria é obrigatória.";
    if (!form.frequency) return "A frequência é obrigatória.";
    if (!form.target_count || form.target_count < 1) return "Informe uma meta válida (mínimo 1).";
    return "";
  }

  async function handleSave() {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        frequency: form.frequency as Frequency,
        days_of_week: form.days_of_week.length ? form.days_of_week.join(",") : null,
        target_count: Number(form.target_count),
        color: form.color,
        icon: form.icon,
      };
      if (editing) {
        await editHabit(editing.id, payload);
        toast.success("Hábito atualizado com sucesso!");
      } else {
        await addHabit(payload);
        toast.success("Hábito criado com sucesso!");
      }
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
      toast.error("Erro ao salvar hábito.");
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(h: Habit) {
    try {
      const res = await toggleHabit(h.id, today);
      if (res.newRecord) {
        setCelebrating(h.id);
        toast.success(`🏆 Novo recorde: ${res.completed ? "" : ""}sequência batida!`);
        setTimeout(() => setCelebrating(null), 700);
      } else if (res.completed) {
        toast.success("Hábito concluído hoje!");
      }
    } catch {
      toast.error("Erro ao registrar hábito.");
    }
  }

  async function togglePause(h: Habit) {
    try {
      await editHabit(h.id, { is_active: !h.is_active });
      toast.success(h.is_active ? "Hábito pausado." : "Hábito ativado.");
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeHabit(deleteTarget.id);
      toast.success("Hábito excluído com sucesso!");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function weeklyCount(h: Habit): number {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const startIso = toISODate(start);
    return logs.filter((l) => l.habit_id === h.id && l.completed_date >= startIso && l.completed_date <= today).length;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Repeat className="h-6 w-6" /> Meus Hábitos</h2>
          <p className="text-muted-foreground text-sm">Construa rotinas consistentes</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="w-full sm:w-auto"><Plus /> Novo Hábito</Button>
      </div>

      {habits.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Você ainda não criou nenhum hábito. Comece agora! 🌱</CardContent></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((h) => {
          const done = isHabitDone(h.id, today);
          const progress = Math.min(100, (weeklyCount(h) / Math.max(1, h.target_count)) * 100);
          return (
            <Card key={h.id} className={`relative overflow-hidden ${!h.is_active ? "opacity-60" : ""}`}>
              <div className="h-1.5 w-full" style={{ background: h.color }} />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-3xl ${celebrating === h.id ? "animate-celebrate" : ""}`}>{h.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{h.name}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{h.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{frequencyLabel[h.frequency]}</Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(h); setOpen(true); }}><Pencil /> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePause(h)}>
                        {h.is_active ? <><Pause /> Pausar</> : <><Play /> Ativar</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(h)} className="text-destructive focus:text-destructive"><Trash2 /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" /> {h.current_streak} dias</span>
                  <span className="inline-flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" /> {h.best_streak} recorde</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Meta semanal</span><span>{weeklyCount(h)}/{h.target_count}</span>
                  </div>
                  <Progress value={progress} indicatorColor={h.color} />
                </div>

                <Button
                  onClick={() => onToggle(h)}
                  disabled={!h.is_active}
                  variant={done ? "secondary" : "default"}
                  className="w-full"
                  style={done ? {} : { background: h.color }}
                >
                  <Check /> {done ? "Concluído hoje" : "Marcar como feito"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Habit form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Hábito" : "Novo Hábito"}</DialogTitle>
            <DialogDescription>Defina os detalhes do seu hábito.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {error && <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert>}
            <div>
              <Label>Nome do hábito *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Beber água" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Opcional" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Categoria *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{HABIT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequência *</Label>
                <Select value={form.frequency} onValueChange={(v) => set("frequency", v as Frequency)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="dias_alternados">Dias alternados</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(form.frequency === "semanal" || form.frequency === "personalizado") && (
              <div>
                <Label>Dias da semana</Label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {WEEK_DAYS.map((d) => (
                    <label key={d.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox checked={form.days_of_week.includes(d.key)} onCheckedChange={() => toggleDay(d.key)} />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Meta de vezes *</Label>
                <Input type="number" min={1} value={form.target_count} onChange={(e) => set("target_count", Number(e.target.value))} />
              </div>
              <div>
                <Label>Cor</Label>
                <Input type="color" className="h-10 p-1" value={form.color} onChange={(e) => set("color", e.target.value)} />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HABIT_ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="animate-spin" />} Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir hábito</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este hábito? Todo o histórico será removido.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toISODate } from "@/lib/db";
import { TASK_CATEGORIES } from "@/lib/types";
import type { Task, Priority } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Task | null;
  defaultDate?: string;
}

const empty = (date: string) => ({
  title: "", description: "", category: "", priority: "" as Priority | "",
  date, start_time: "08:00", end_time: "09:00",
  reminder: false, reminder_time: "07:45", notes: "",
});

export default function TaskDialog({ open, onOpenChange, editing, defaultDate }: Props) {
  const { addTask, editTask } = useData();
  const [form, setForm] = useState(empty(defaultDate || toISODate(new Date())));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      if (editing) {
        setForm({
          title: editing.title, description: editing.description || "",
          category: editing.category, priority: editing.priority,
          date: editing.date, start_time: editing.start_time, end_time: editing.end_time,
          reminder: editing.reminder, reminder_time: editing.reminder_time || "07:45",
          notes: editing.notes || "",
        });
      } else {
        setForm(empty(defaultDate || toISODate(new Date())));
      }
    }
  }, [open, editing, defaultDate]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate(): string {
    if (!form.title.trim()) return "O título é obrigatório.";
    if (!form.category) return "A categoria é obrigatória.";
    if (!form.priority) return "A prioridade é obrigatória.";
    if (!form.date) return "A data é obrigatória.";
    if (!form.start_time) return "O horário de início é obrigatório.";
    if (!form.end_time) return "O horário de término é obrigatório.";
    if (form.end_time <= form.start_time) return "O horário de término deve ser posterior ao de início.";
    return "";
  }

  async function handleSave() {
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        priority: form.priority as Priority,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        reminder: form.reminder,
        reminder_time: form.reminder ? form.reminder_time : null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        await editTask(editing.id, payload);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await addTask({ ...payload, status: "pendente" });
        toast.success("Tarefa criada com sucesso!");
      }
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
      toast.error("Erro ao salvar a tarefa.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>Preencha os detalhes da tarefa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {error && (
            <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert>
          )}
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Reunião de equipe" />
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
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade *</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hora de início *</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
            </div>
            <div>
              <Label>Hora de término *</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="mb-0">Lembrete</Label>
              <p className="text-xs text-muted-foreground">Notificar antes da tarefa</p>
            </div>
            <Switch checked={form.reminder} onCheckedChange={(v) => set("reminder", v)} />
          </div>
          {form.reminder && (
            <div>
              <Label>Horário do lembrete</Label>
              <Input type="time" value={form.reminder_time} onChange={(e) => set("reminder_time", e.target.value)} />
            </div>
          )}
          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

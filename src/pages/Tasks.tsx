import { useMemo, useState } from "react";
import { Plus, Play, Check, Pencil, Trash2, Search, Loader2, ListTodo } from "lucide-react";
import { useData } from "@/context/DataContext";
import { TASK_CATEGORIES } from "@/lib/types";
import type { Task } from "@/lib/types";
import {
  priorityLabel, priorityBadgeClass, statusLabel, statusBadgeClass, priorityColor, formatShortDate,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import TaskDialog from "@/components/TaskDialog";
import { toast } from "@/components/ui/sonner";

export default function Tasks() {
  const { tasks, editTask, removeTask } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [fStatus, setFStatus] = useState("todas");
  const [fPriority, setFPriority] = useState("todas");
  const [fCategory, setFCategory] = useState("todas");
  const [fDate, setFDate] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (fStatus === "todas" ? true : t.status === fStatus))
      .filter((t) => (fPriority === "todas" ? true : t.priority === fPriority))
      .filter((t) => (fCategory === "todas" ? true : t.category === fCategory))
      .filter((t) => (fDate ? t.date === fDate : true))
      .filter((t) => (search ? t.title.toLowerCase().includes(search.toLowerCase()) : true))
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  }, [tasks, fStatus, fPriority, fCategory, fDate, search]);

  async function changeStatus(t: Task, status: Task["status"]) {
    try {
      await editTask(t.id, { status });
      toast.success(status === "concluida" ? "Tarefa concluída!" : "Tarefa iniciada!");
    } catch {
      toast.error("Erro ao atualizar tarefa.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeTask(deleteTarget.id);
      toast.success("Tarefa excluída com sucesso!");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao excluir tarefa.");
    } finally {
      setDeleting(false);
    }
  }

  function openNew() { setEditing(null); setDialogOpen(true); }
  function openEdit(t: Task) { setEditing(t); setDialogOpen(true); }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ListTodo className="h-6 w-6" /> Minhas Tarefas</h2>
          <p className="text-muted-foreground text-sm">{filtered.length} tarefa(s) encontrada(s)</p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto"><Plus /> Nova Tarefa</Button>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Título..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prioridade</Label>
            <Select value={fPriority} onValueChange={setFPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={fCategory} onValueChange={setFCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Nenhuma tarefa encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t) => {
                const completed = t.status === "concluida";
                return (
                  <TableRow key={t.id} className={completed ? "opacity-60" : ""}>
                    <TableCell><Badge className={statusBadgeClass[t.status]}>{statusLabel[t.status]}</Badge></TableCell>
                    <TableCell className={`font-medium ${completed ? "line-through" : ""}`}>{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">{t.category}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: priorityColor[t.priority] }} />
                        <span className={`text-xs px-1.5 rounded ${priorityBadgeClass[t.priority]}`}>{priorityLabel[t.priority]}</span>
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{t.start_time}–{t.end_time}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatShortDate(t.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {t.status === "pendente" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Iniciar" onClick={() => changeStatus(t, "em_andamento")}>
                            <Play className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        {t.status !== "concluida" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Concluir" onClick={() => changeStatus(t, "concluida")}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Excluir" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir tarefa</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />} Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

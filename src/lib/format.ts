import type { Priority, TaskStatus, Frequency } from "./types";

const WEEKDAYS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function formatLongDate(d: Date): string {
  return `${WEEKDAYS_PT[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const [y, m, dd] = iso.split("-");
  return `${dd}/${m}/${y}`;
}

export function monthLabel(d: Date): string {
  return `${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

export const priorityLabel: Record<Priority, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
export const priorityColor: Record<Priority, string> = {
  alta: "#ef4444",
  media: "#eab308",
  baixa: "#3b82f6",
};
export const priorityBadgeClass: Record<Priority, string> = {
  alta: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  media: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  baixa: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
};

export const statusLabel: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
};
export const statusBadgeClass: Record<TaskStatus, string> = {
  pendente: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  em_andamento: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  concluida: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
};

export const frequencyLabel: Record<Frequency, string> = {
  diario: "Diário",
  semanal: "Semanal",
  dias_alternados: "Dias alternados",
  personalizado: "Personalizado",
};

export const MONTHS = MONTHS_PT;
export const WEEKDAYS = WEEKDAYS_PT;

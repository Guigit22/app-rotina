import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, Home, ListTodo, Repeat, Calendar, BarChart3, LogOut, Moon, Sun, CalendarCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatLongDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/tarefas", label: "Minhas Tarefas", icon: ListTodo },
  { to: "/habitos", label: "Meus Hábitos", icon: Repeat },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2 sm:py-3 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm sm:text-base font-semibold leading-tight truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {formatLongDate(new Date())}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navegação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.to;
                  return (
                    <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)} className={active ? "bg-accent text-accent-foreground" : ""}>
                      <Icon /> {item.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 animate-fadein">{children}</main>
    </div>
  );
}

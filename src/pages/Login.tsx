import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, AlertCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  function validate(): string {
    if (!email.trim()) return "O email é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Digite um email válido.";
    if (!password) return "A senha é obrigatória.";
    if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error("Digite um email válido.");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      toast.success("Email de recuperação enviado!");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
            <CalendarCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Planejador de Rotina</h1>
          <p className="text-sm text-muted-foreground">Organize seus dias, construa hábitos.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setForgotOpen(true)} className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />} Entrar
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">Cadastre-se</Link>
            </p>
            {!isSupabaseConfigured && (
              <p className="mt-4 text-xs text-center text-muted-foreground bg-muted rounded-md p-2">
                Modo demonstração ativo (dados locais). Crie uma conta para começar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>Informe seu email para receber o link de recuperação.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="forgot">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="forgot" type="email" className="pl-9" placeholder="voce@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancelar</Button>
            <Button onClick={handleForgot} disabled={forgotLoading}>
              {forgotLoading && <Loader2 className="animate-spin" />} Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

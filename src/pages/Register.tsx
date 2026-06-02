import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): string {
    if (!name.trim() || !email.trim() || !password || !confirm) return "Todos os campos são obrigatórios.";
    if (name.trim().length < 2) return "O nome deve ter no mínimo 2 caracteres.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Digite um email válido.";
    if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    if (password !== confirm) return "As senhas não coincidem.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setLoading(true);
    try {
      await signUp(name.trim(), email, password);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-3 sm:px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
            <CalendarCheck className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold">Criar conta</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Cadastro</CardTitle>
            <CardDescription className="text-xs md:text-sm">Preencha seus dados para começar</CardDescription>
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
                <Label htmlFor="name" className="text-xs md:text-sm">Nome completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="text-sm" />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="text-sm" />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs md:text-sm">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="text-sm" />
              </div>
              <div>
                <Label htmlFor="confirm" className="text-xs md:text-sm">Confirmar senha</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" className="text-sm" />
              </div>
              <Button type="submit" className="w-full text-sm" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />} Cadastrar
              </Button>
            </form>
            <p className="mt-4 text-center text-xs md:text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium hover:underline">Já tenho conta</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

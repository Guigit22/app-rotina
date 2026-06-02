import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, AlertCircle, Loader2, Mail, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-3 sm:px-4 py-8 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding Section */}
        <div className="flex flex-col items-center mb-8 animate-fadeIn">
          <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 shadow-2xl mb-4 transform hover:scale-105 transition-transform duration-300">
            <CalendarCheck className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">Planejador de Rotina</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Organize seus dias, construa hábitos</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-slideUp">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Entre com suas credenciais para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 text-sm h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs md:text-sm font-medium">Senha</Label>
                <div className="relative group">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pr-10 text-sm h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setForgotOpen(true)} 
                  className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors hover:underline">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            {/* Demo Mode Notice */}
            {!isSupabaseConfigured && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50">
                <p className="text-xs text-center text-amber-800 dark:text-amber-300">
                  💡 <span className="font-medium">Modo demonstração:</span> Use dados locais. Crie sua conta para começar!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[90%] md:max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Recuperar Senha</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Informe seu email para receber um link de recuperação</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="forgot" className="text-xs md:text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="forgot" 
                  type="email" 
                  className="pl-10 text-sm h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20" 
                  placeholder="seu@email.com" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setForgotOpen(false)} 
              className="text-xs sm:text-sm h-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleForgot} 
              disabled={forgotLoading}
              className="text-xs sm:text-sm h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg"
            >
              {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              {forgotLoading ? "Enviando..." : "Enviar Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

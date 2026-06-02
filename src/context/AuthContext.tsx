import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_KEY = "pr_demo_user";
const DEMO_USERS = "pr_demo_accounts";

interface DemoAccount {
  id: string;
  email: string;
  name: string;
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (mounted && data.session?.user) {
          const u = data.session.user;
          setUser({
            id: u.id,
            email: u.email || "",
            name: (u.user_metadata?.name as string) || u.email?.split("@")[0] || "Usuário",
          });
        }
        supabase.auth.onAuthStateChange((_e, session) => {
          if (session?.user) {
            const u = session.user;
            setUser({
              id: u.id,
              email: u.email || "",
              name: (u.user_metadata?.name as string) || u.email?.split("@")[0] || "Usuário",
            });
          } else {
            setUser(null);
          }
        });
      } else {
        const stored = localStorage.getItem(DEMO_KEY);
        if (stored && mounted) setUser(JSON.parse(stored));
      }
      if (mounted) setLoading(false);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Demo helpers ----------
  function demoAccounts(): DemoAccount[] {
    try {
      return JSON.parse(localStorage.getItem(DEMO_USERS) || "[]");
    } catch {
      return [];
    }
  }

  async function signIn(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
      return;
    }
    const accounts = demoAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!acc || acc.password !== password) {
      throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
    }
    const u: AppUser = { id: acc.id, email: acc.email, name: acc.name };
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function signUp(name: string, email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw new Error(error.message);
      // Auto sign-in attempt (works if email confirmation disabled)
      await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
      return;
    }
    const accounts = demoAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Este email já está cadastrado.");
    }
    const acc: DemoAccount = { id: crypto.randomUUID(), email, name, password };
    accounts.push(acc);
    localStorage.setItem(DEMO_USERS, JSON.stringify(accounts));
    const u: AppUser = { id: acc.id, email: acc.email, name: acc.name };
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
    setUser(null);
  }

  async function resetPassword(email: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      });
      if (error) throw new Error(error.message);
      return;
    }
    const accounts = demoAccounts();
    if (!accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email não encontrado.");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

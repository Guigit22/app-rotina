import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * isSupabaseConfigured indicates whether real Supabase credentials are present.
 * When false the app runs in a local demo mode (data persisted to localStorage)
 * so it can be previewed without a backend. Provide the .env variables to use
 * the real Supabase backend.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export const APP_NAME = (import.meta.env.VITE_APP_NAME as string) || "PlanejadorDeRotina";

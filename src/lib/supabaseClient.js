import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "N2Koaching: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants. " +
    "Copiez .env.example vers .env et renseignez vos clés Supabase (voir README.md)."
  );
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
export const supabaseConfigured = Boolean(url && anonKey);

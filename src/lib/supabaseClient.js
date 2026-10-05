import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://shrtxqxukkhhzkfekjpw.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_YTvLowdGqfferCm-u2Hk-Q_qd9kz9fF";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("CareSetu: Supabase environment variables are missing. Please verify .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

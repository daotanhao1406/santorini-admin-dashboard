// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Hãy chắc chắn bạn đã tạo file .env.local và điền 2 biến này vào
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Thiếu Supabase URL hoặc Anon Key trong file .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

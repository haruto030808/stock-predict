import { createClient } from '@supabase/supabase-js'

// 💡 ここが重要： import.meta.env を使って読み込んでいるか
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
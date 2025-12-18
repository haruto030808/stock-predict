import { createClient } from '@supabase/supabase-js'

// Supabaseの管理画面（Settings > API）にあるURLとAnon Keyをここに入れます
const supabaseUrl = 'https://tzztsbnarrjebpejkvvy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6enRzYm5hcnJqZWJwZWprdnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDYxNTUsImV4cCI6MjA4MTYyMjE1NX0.AIYKbHGVUmt80KfKF0n2lcKeqho2vHB3XbwdY_OPzjA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
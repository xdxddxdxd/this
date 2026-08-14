import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lisonamppgsgoswkkjyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc29uYW1wcGdzZ29zd2tranlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzQxNDQsImV4cCI6MjEwMjI1MDE0NH0.NF8M6M5lD0PY18Nq0aXcSuZsQunmguGhLlYiLChArP4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
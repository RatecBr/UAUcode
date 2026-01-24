import { createClient } from '@supabase/supabase-js';

// Configuration from your project
const SUPABASE_URL = 'https://anzxgurkbpyegcibebfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuenhndXJrYnB5ZWdjaWJlYmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTAyMDQsImV4cCI6MjA4NDc4NjIwNH0.WbUAp1ubHF4hNTU8gSANrJNskI_qL69q4w_wJun_svk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

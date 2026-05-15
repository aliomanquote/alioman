import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ellyncnfrlghkrlbyhcr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbHluY25mcmxnaGtybGJ5aGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzYxNTIsImV4cCI6MjA5NDM1MjE1Mn0.Dxs8j9A0Jrs4ZPH1IND3o51-pcKgAi-V8jT4uZKvVbw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

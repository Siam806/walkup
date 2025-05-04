import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aqsgngquzxlqmrpcevkh.supabase.co"; // Extracted from your connection string
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc2duZ3F1enhscW1ycGNldmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNTIxOTgsImV4cCI6MjA2MTkyODE5OH0.C3KatBnHwAM8CUzOlRGfIMggkX494YQ7gr5vJelJXx4"; // Replace with your actual anon key from the Supabase dashboard
export const supabase = createClient(supabaseUrl, supabaseKey);
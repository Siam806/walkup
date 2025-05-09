import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase URL and Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Base client with minimal config - safe for SSR
export const supabase = createClient(supabaseUrl, supabaseKey);

// Browser-only client with persistence
let browserClient;
export function getBrowserClient() {
  if (typeof window === 'undefined') {
    return supabase; // Return non-persistent client during SSR
  }
  
  if (!browserClient) {
    // Initialize the browser client only once
    browserClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  
  return browserClient;
}

// Hook for React components
export function useSupabase() {
  return typeof window === 'undefined' ? supabase : getBrowserClient();
}
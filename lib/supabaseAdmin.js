import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the secret key (bypasses RLS).
// NEVER import this from a client component or expose the key to the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminClient() {
  if (!url || !secretKey) {
    throw new Error("Supabase admin env vars (URL / SERVICE_ROLE_KEY) are not set");
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

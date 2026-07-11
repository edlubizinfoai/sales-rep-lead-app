import { createClient } from "@supabase/supabase-js";

// Server-only. Bypasses RLS entirely via the service_role key — never import
// this into client code or any path that isn't verifying its own auth.
// Needed for the Stripe webhook, which has no user session to run RLS
// policies against (it's a server-to-server call authenticated by the Stripe
// signature, not a logged-in user).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

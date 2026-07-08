import { cookies } from "next/headers";

export const VISITOR_COOKIE = "visitor_id";

// Anonymous visitor identity used pre-auth (v1 has no login wall). Stored in
// the leads/subscriptions `user_id` column so per-visitor free-tier limits
// and paywall unlocks work without an account. Replaced by real auth in the
// lock-down sprint. Route Handlers can mutate cookies, so this both reads
// and (if missing) sets one as a fallback — middleware normally sets it first.
export async function getVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

// Read-only variant for Server Components, which cannot set cookies.
export async function getVisitorIdReadOnly(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}

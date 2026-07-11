"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthBar({ email }: { email: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-4 px-4 py-2 text-sm sm:px-6 lg:px-8">
        {email ? (
          <>
            <span className="text-slate-500">{email}</span>
            <button
              onClick={handleLogout}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="font-medium text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

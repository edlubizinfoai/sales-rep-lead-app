import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthBar } from "@/components/auth-bar";

export const metadata: Metadata = {
  title: "Sales Rep Lead Tracker",
  description: "A focused lead-tracking tool for sales reps.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <AuthBar email={user?.email ?? null} />
        {children}
      </body>
    </html>
  );
}

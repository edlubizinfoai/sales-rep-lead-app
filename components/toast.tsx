"use client";

export interface ToastState {
  message: string;
  kind: "success" | "error";
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  const color =
    toast.kind === "success"
      ? "bg-emerald-600"
      : "bg-rose-600";

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${color}`}
      >
        {toast.message}
      </div>
    </div>
  );
}

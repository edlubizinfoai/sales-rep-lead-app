import type { Activity } from "@/lib/types";

const TYPE_ICON: Record<Activity["activity_type"], string> = {
  call: "📞",
  email: "✉️",
  meeting: "🗓️",
  note: "📝",
};

const TYPE_LABEL: Record<Activity["activity_type"], string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-400">No activity logged yet.</p>
    );
  }

  return (
    <ol className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex gap-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100 text-sm">
            {TYPE_ICON[activity.activity_type]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-medium text-slate-900">
                {TYPE_LABEL[activity.activity_type]}
              </span>
              <span className="text-xs text-slate-400">
                {formatDateTime(activity.occurred_at)}
              </span>
            </div>
            {activity.notes && (
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">
                {activity.notes}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

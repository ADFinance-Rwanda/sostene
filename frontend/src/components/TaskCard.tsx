import { useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../api/types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void | Promise<void>;
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  todo: "bg-blue-500 text-white",
  in_progress: "bg-amber-500 text-white",
  done: "bg-emerald-500 text-white",
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: "border-slate-400 text-slate-500",
  medium: "border-amber-400 text-amber-600",
  high: "border-red-400 text-red-600",
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await onDelete(task);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  const due = formatDate(task.due_date);

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
      <header className="flex flex-col gap-2">
        <h3 className="text-[15px] font-semibold text-slate-900 leading-tight break-words">
          {task.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status]}`}
          >
            {task.status.replace("_", " ")}
          </span>
          <span
            className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-transparent border ${PRIORITY_BADGE[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      </header>

      {task.description ? (
        <p className="text-sm text-slate-500 leading-relaxed break-words whitespace-pre-wrap">
          {task.description}
        </p>
      ) : (
        <p className="text-sm italic text-slate-400">No description</p>
      )}

      {due && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Due
          </span>
          <span>{due}</span>
        </p>
      )}

      <footer className="flex justify-end gap-2 mt-1">
        {confirming ? (
          <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500">
            <span>Delete this task?</span>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-white font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </footer>
    </article>
  );
}

export default TaskCard;

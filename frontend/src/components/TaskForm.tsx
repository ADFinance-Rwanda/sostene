import { useEffect, useState } from "react";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from "../api/types";

interface Props {
  open: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
}

function toFormState(task?: Task | null): FormState {
  if (!task) {
    return {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    };
  }
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
  };
}

const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors";

export function TaskForm({ open, initialTask, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialTask));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialTask));
      setError(null);
    }
  }, [open, initialTask]);

  if (!open) return null;

  const isEdit = Boolean(initialTask);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }
    if (title.length > 255) {
      setError("Title must be at most 255 characters.");
      return;
    }

    const payload: CreateTaskInput | UpdateTaskInput = {
      title,
      description: form.description.trim() ? form.description.trim() : null,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
          <h2 className="text-[17px] font-semibold text-slate-900">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </header>

        <form
          className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabelClass}>Title *</span>
            <input
              type="text"
              maxLength={255}
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabelClass}>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={`${inputClass} resize-y min-h-24`}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabelClass}>Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as TaskStatus,
                  }))
                }
                className={inputClass}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={fieldLabelClass}>Priority</span>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as TaskPriority,
                  }))
                }
                className={inputClass}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={fieldLabelClass}>Due date</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
                className={inputClass}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <footer className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;

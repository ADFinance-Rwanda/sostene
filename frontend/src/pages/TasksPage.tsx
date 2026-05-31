import { useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useTasks } from "../hooks/useTasks";
import { STATUS_LABELS } from "../lib/taskLabels";
import {
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from "../api/types";

export function TasksPage() {
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    clearError,
  } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(input: CreateTaskInput | UpdateTaskInput) {
    if (editing) {
      await updateTask(editing.id, input);
    } else {
      await createTask(input as CreateTaskInput);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col xs:flex-row xs:flex-wrap xs:items-end xs:justify-between gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Tasks
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Organize your work across three lanes.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors w-full xs:w-auto"
        >
          + New task
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="inline-flex items-center rounded-md border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
          <div className="h-7 w-7 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
          <p>Loading tasks…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {TASK_STATUSES.map((status) => (
            <section
              key={status}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col min-h-[200px]"
            >
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {grouped[status].length}
                </span>
              </header>
              <div className="flex flex-col gap-3 flex-1">
                {grouped[status].length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-5">
                    Nothing here yet.
                  </p>
                ) : (
                  grouped[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={(t) => deleteTask(t.id)}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <TaskForm
        open={formOpen}
        initialTask={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default TasksPage;

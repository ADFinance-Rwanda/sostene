import type { TaskPriority, TaskStatus } from "../api/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "#3b82f6",
  in_progress: "#f59e0b",
  done: "#10b981",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

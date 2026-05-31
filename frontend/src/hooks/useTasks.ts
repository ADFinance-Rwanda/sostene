import { useCallback, useEffect, useReducer } from "react";
import * as tasksApi from "../api/client";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../api/types";
import { getErrorMessage } from "../lib/errors";

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type TasksAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; tasks: Task[] }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "UPSERT"; task: Task }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_ERROR" };

const initialState: TasksState = { tasks: [], loading: true, error: null };

function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return { tasks: action.tasks, loading: false, error: null };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.error };
    case "UPSERT": {
      const exists = state.tasks.some((task) => task.id === action.task.id);
      const tasks = exists
        ? state.tasks.map((task) =>
            task.id === action.task.id ? action.task : task,
          )
        : [action.task, ...state.tasks];
      return { ...state, tasks, error: null };
    }
    case "DELETE":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useTasks() {
  const [state, dispatch] = useReducer(tasksReducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const tasks = await tasksApi.getTasks();
      dispatch({ type: "LOAD_SUCCESS", tasks });
    } catch (err) {
      dispatch({
        type: "LOAD_ERROR",
        error: getErrorMessage(err, "Failed to load tasks"),
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      try {
        const task = await tasksApi.createTask(input);
        dispatch({ type: "UPSERT", task });
        return task;
      } catch (err) {
        const message = getErrorMessage(err, "Failed to create task");
        dispatch({ type: "LOAD_ERROR", error: message });
        throw new Error(message);
      }
    },
    [],
  );

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<Task> => {
      try {
        const task = await tasksApi.updateTask(id, input);
        dispatch({ type: "UPSERT", task });
        return task;
      } catch (err) {
        const message = getErrorMessage(err, "Failed to update task");
        dispatch({ type: "LOAD_ERROR", error: message });
        throw new Error(message);
      }
    },
    [],
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await tasksApi.deleteTask(id);
      dispatch({ type: "DELETE", id });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete task");
      dispatch({ type: "LOAD_ERROR", error: message });
      throw new Error(message);
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    clearError,
  };
}

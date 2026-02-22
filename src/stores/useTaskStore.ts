import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import type { Task, QuadrantType, TaskStatus } from '@/types'

interface TaskStore {
  tasks: Task[]
  addTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedPomodoros'>,
  ) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  setStatus: (id: string, status: TaskStatus) => void
  moveTask: (id: string, quadrant: QuadrantType) => void
  reorderTask: (id: string, newOrder: number) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (taskData) => {
        const now = new Date().toISOString()
        const newTask: Task = {
          ...taskData,
          id: nanoid(),
          completedPomodoros: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
        return newTask
      },

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      setStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt:
                    status === 'done' ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),

      moveTask: (id, quadrant) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, quadrant, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      reorderTask: (id, newOrder) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, order: newOrder, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),
    }),
    { name: 'task-store' },
  ),
)

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

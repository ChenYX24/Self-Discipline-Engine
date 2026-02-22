import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Habit } from '@/types'

interface HabitStore {
  habits: Habit[]
  addHabit: (
    habit: Omit<
      Habit,
      'id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak'
    >,
  ) => Habit
  updateHabit: (id: string, patch: Partial<Habit>) => void
  removeHabit: (id: string) => void
  getActiveHabits: () => Habit[]
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (habitData) => {
        const now = new Date().toISOString()
        const newHabit: Habit = {
          ...habitData,
          id: nanoid(),
          currentStreak: 0,
          longestStreak: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ habits: [...state.habits, newHabit] }))
        return newHabit
      },

      updateHabit: (id, patch) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? { ...h, ...patch, updatedAt: new Date().toISOString() }
              : h,
          ),
        })),

      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      getActiveHabits: () => get().habits.filter((h) => h.isActive),
    }),
    {
      name: 'habit-store',
    },
  ),
)

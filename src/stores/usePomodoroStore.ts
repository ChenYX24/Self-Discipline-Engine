import { create } from 'zustand'
import type { PomodoroMode } from '@/types'

interface PomodoroState {
  mode: PomodoroMode
  isRunning: boolean
  timeRemaining: number
  currentTaskId: string | null
  completedToday: number
  setMode: (mode: PomodoroMode) => void
  setRunning: (running: boolean) => void
  setTimeRemaining: (time: number) => void
  setCurrentTask: (taskId: string | null) => void
  incrementCompleted: () => void
  reset: (duration: number) => void
}

export const usePomodoroStore = create<PomodoroState>()((set) => ({
  mode: 'focus',
  isRunning: false,
  timeRemaining: 25 * 60,
  currentTaskId: null,
  completedToday: 0,

  setMode: (mode) => set({ mode }),
  setRunning: (isRunning) => set({ isRunning }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setCurrentTask: (currentTaskId) => set({ currentTaskId }),
  incrementCompleted: () =>
    set((state) => ({ completedToday: state.completedToday + 1 })),
  reset: (duration) => set({ timeRemaining: duration, isRunning: false }),
}))

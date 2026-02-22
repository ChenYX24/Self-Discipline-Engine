import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppConfig, ThemeMode } from '@/types'

interface AppStore {
  config: AppConfig
  sidebarCollapsed: boolean
  updateConfig: (patch: Partial<AppConfig>) => void
  updateAIConfig: (patch: Partial<AppConfig['ai']>) => void
  updatePomodoroConfig: (patch: Partial<AppConfig['pomodoro']>) => void
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
}

const defaultConfig: AppConfig = {
  userName: '',
  identityStatement: '',
  theme: 'system',
  locale: 'zh-CN',
  ai: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
  },
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: false,
    soundEnabled: true,
    notificationEnabled: true,
  },
  notifications: {
    habitReminder: true,
    habitReminderTime: '08:00',
    reflectionEnabled: true,
    reflectionInterval: 90,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      sidebarCollapsed: false,

      updateConfig: (patch) =>
        set((state) => ({
          config: {
            ...state.config,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateAIConfig: (patch) =>
        set((state) => ({
          config: {
            ...state.config,
            ai: { ...state.config.ai, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      updatePomodoroConfig: (patch) =>
        set((state) => ({
          config: {
            ...state.config,
            pomodoro: { ...state.config.pomodoro, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      setTheme: (theme) =>
        set((state) => ({
          config: {
            ...state.config,
            theme,
            updatedAt: new Date().toISOString(),
          },
        })),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: 'app-config',
    },
  ),
)

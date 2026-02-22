// ==================== 基础类型 ====================

export type UUID = string
export type ISODateTime = string
export type QuadrantType =
  | 'urgent-important'
  | 'not-urgent-important'
  | 'urgent-not-important'
  | 'not-urgent-not-important'
export type GoalLevel = 'yearly' | 'monthly' | 'weekly'
export type GoalStatus = 'active' | 'completed' | 'abandoned'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type PomodoroMode = 'focus' | 'short_break' | 'long_break'
export type AIProvider = 'openai' | 'anthropic' | 'custom'
export type ThemeMode = 'light' | 'dark' | 'system'

// ==================== 应用配置 ====================

export interface AppConfig {
  userName: string
  identityStatement: string
  theme: ThemeMode
  locale: 'zh-CN'
  ai: {
    provider: AIProvider
    apiKey: string
    model: string
    customEndpoint?: string
  }
  pomodoro: {
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number
    autoStartNext: boolean
    soundEnabled: boolean
    notificationEnabled: boolean
  }
  notifications: {
    habitReminder: boolean
    habitReminderTime: string
    reflectionEnabled: boolean
    reflectionInterval: number
  }
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

// ==================== 任务（四象限） ====================

export interface Task {
  id: UUID
  title: string
  description?: string
  quadrant: QuadrantType
  status: TaskStatus
  goalId?: UUID
  date: string
  estimatedPomodoros: number
  completedPomodoros: number
  pointsReward: number
  dueTime?: string
  tags: string[]
  order: number
  completedAt?: ISODateTime
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

// ==================== 习惯 ====================

export interface Habit {
  id: UUID
  name: string
  description?: string
  icon: string
  targetValue: number
  unit: string
  frequency: 'daily' | 'weekdays' | 'custom'
  customDays?: number[]
  pointsReward: number
  currentStreak: number
  longestStreak: number
  isActive: boolean
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface HabitLog {
  id: UUID
  habitId: UUID
  date: string
  completed: boolean
  value?: number
  note?: string
  createdAt: ISODateTime
}

// ==================== 番茄钟 ====================

export interface PomodoroSession {
  id: UUID
  taskId?: UUID
  mode: PomodoroMode
  duration: number
  elapsed: number
  completed: boolean
  startedAt: ISODateTime
  endedAt?: ISODateTime
}

// ==================== 奖惩系统 ====================

export interface Reward {
  id: UUID
  name: string
  description?: string
  icon: string
  cost: number
  category: string
  timesRedeemed: number
  isActive: boolean
  createdAt: ISODateTime
}

export interface Punishment {
  id: UUID
  name: string
  description?: string
  icon: string
  triggerCondition: 'task_incomplete' | 'habit_missed' | 'streak_broken'
  pointsPenalty: number
  isActive: boolean
  createdAt: ISODateTime
}

export interface PointsTransaction {
  id: UUID
  amount: number
  type:
    | 'task_complete'
    | 'habit_complete'
    | 'streak_bonus'
    | 'reward_redeem'
    | 'punishment'
    | 'manual'
  sourceId?: UUID
  description: string
  createdAt: ISODateTime
}

export interface UserLevel {
  level: number
  totalPoints: number
  currentPoints: number
  pointsToNextLevel: number
}

// ==================== 愿景系统 ====================

export interface Vision {
  id: UUID
  antiVision: string
  antiVisionOneLiner: string
  vision: string
  visionOneLiner: string
  identityStatement: string
  constraints: string[]
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface Goal {
  id: UUID
  title: string
  description: string
  level: GoalLevel
  status: GoalStatus
  parentGoalId?: UUID
  visionId?: UUID
  targetValue?: number
  currentValue: number
  unit?: string
  deadline: ISODateTime
  completedAt?: ISODateTime
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

// ==================== 成就 ====================

export interface Achievement {
  id: UUID
  key: string
  name: string
  description: string
  icon: string
  condition: string
  unlockedAt?: ISODateTime
}

// ==================== 等级计算 ====================

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
] as const

export function calculateLevel(totalPoints: number): UserLevel {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold =
    LEVEL_THRESHOLDS[level] ?? currentThreshold + 1000

  return {
    level,
    totalPoints,
    currentPoints: totalPoints - currentThreshold,
    pointsToNextLevel: nextThreshold - totalPoints,
  }
}

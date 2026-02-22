import Dexie, { type EntityTable } from 'dexie'
import type {
  PomodoroSession,
  HabitLog,
  PointsTransaction,
  Achievement,
  Task,
} from '@/types'

class SelfDisciplineDB extends Dexie {
  pomodoroSessions!: EntityTable<PomodoroSession, 'id'>
  habitLogs!: EntityTable<HabitLog, 'id'>
  pointsTransactions!: EntityTable<PointsTransaction, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  archivedTasks!: EntityTable<Task, 'id'>

  constructor() {
    super('self-discipline-engine')

    this.version(1).stores({
      pomodoroSessions: 'id, taskId, startedAt, completed',
      habitLogs: 'id, habitId, date, [habitId+date]',
      pointsTransactions: 'id, type, createdAt',
      achievements: 'id, key, unlockedAt',
      archivedTasks: 'id, quadrant, date, status',
    })
  }
}

export const db = new SelfDisciplineDB()

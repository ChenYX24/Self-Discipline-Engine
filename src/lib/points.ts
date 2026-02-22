import { calculateLevel, type UserLevel } from '@/types'

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: '初学者',
    2: '新手',
    3: '学徒',
    4: '实践者',
    5: '自律者',
    6: '专注者',
    7: '征服者',
    8: '大师',
    9: '传奇',
    10: '觉醒者',
  }
  return titles[level] ?? '未知'
}

export function getLevelProgress(userLevel: UserLevel): number {
  const total = userLevel.currentPoints + userLevel.pointsToNextLevel
  if (total === 0) return 0
  return Math.round((userLevel.currentPoints / total) * 100)
}

export { calculateLevel }

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  Timer,
  CheckSquare,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useTaskStore, getTodayDateString } from '@/stores/useTaskStore'
import { useHabitStore } from '@/stores/useHabitStore'
import { usePointsStore } from '@/stores/usePointsStore'
import { useAppStore } from '@/stores/useAppStore'
import { getLevelTitle, calculateLevel } from '@/lib/points'

export function DashboardPage() {
  const config = useAppStore((s) => s.config)
  const allTasks = useTaskStore((s) => s.tasks)
  const allHabits = useHabitStore((s) => s.habits)
  const currentPoints = usePointsStore((s) => s.currentPoints)
  const totalPoints = usePointsStore((s) => s.totalPoints)

  const today = getTodayDateString()
  const tasks = useMemo(
    () => allTasks.filter((t) => t.date === today),
    [allTasks, today],
  )
  const habits = useMemo(
    () => allHabits.filter((h) => h.isActive),
    [allHabits],
  )
  const level = useMemo(() => calculateLevel(totalPoints), [totalPoints])

  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const totalTasks = tasks.length
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}，{config.userName || '自律者'}
            </h1>
            {config.identityStatement && (
              <p className="mt-1 text-sm text-muted-foreground italic">
                "{config.identityStatement}"
              </p>
            )}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Target className="size-4 text-primary" />
                <span>
                  今日任务 {completedTasks}/{totalTasks}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="size-4 text-amber-500" />
                <span>Lv.{level.level} {getLevelTitle(level.level)}</span>
              </div>
            </div>
            {totalTasks > 0 && (
              <div className="mt-3 w-64">
                <Progress value={taskProgress} className="h-2" />
                <span className="text-xs text-muted-foreground mt-1 block">
                  完成进度 {Math.round(taskProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="今日任务"
          value={`${completedTasks}/${totalTasks}`}
          color="text-blue-500"
        />
        <StatCard
          icon={Timer}
          label="番茄完成"
          value="0"
          color="text-red-500"
        />
        <StatCard
          icon={CheckSquare}
          label="习惯打卡"
          value={`0/${habits.length}`}
          color="text-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="当前积分"
          value={currentPoints.toLocaleString()}
          color="text-amber-500"
        />
      </div>

      {/* Today's Tasks Preview */}
      {tasks.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">今日任务</h2>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  className={`size-2 rounded-full ${
                    task.status === 'done' ? 'bg-emerald-500' : 'bg-muted'
                  }`}
                />
                <span
                  className={
                    task.status === 'done'
                      ? 'line-through text-muted-foreground'
                      : ''
                  }
                >
                  {task.title}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {getQuadrantLabel(task.quadrant)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Target className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            今天还没有任务
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            去四象限页面添加今天的任务吧！
          </p>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-accent p-2">
          <Icon className={`size-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function getQuadrantLabel(quadrant: string): string {
  const labels: Record<string, string> = {
    'urgent-important': '重要·紧急',
    'not-urgent-important': '重要·不紧急',
    'urgent-not-important': '不重要·紧急',
    'not-urgent-not-important': '不重要·不紧急',
  }
  return labels[quadrant] ?? quadrant
}

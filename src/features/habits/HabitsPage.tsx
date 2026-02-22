import { useState, useMemo } from 'react'
import { Plus, Check, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useHabitStore } from '@/stores/useHabitStore'
import type { Habit } from '@/types'

export function HabitsPage() {
  const allHabits = useHabitStore((s) => s.habits)
  const habits = useMemo(
    () => allHabits.filter((h) => h.isActive),
    [allHabits],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">习惯打卡</h1>
        <AddHabitDialog />
      </div>

      {/* Today's Habits */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">今日打卡</h2>
        {habits.length > 0 ? (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitItem key={habit.id} habit={habit} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Check className="mx-auto size-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">
              还没有习惯
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              点击"新习惯"开始追踪你的日常习惯
            </p>
          </div>
        )}
      </Card>

      {/* Heatmap Placeholder */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">年度热力图</h2>
        <div className="py-8 text-center text-sm text-muted-foreground">
          开始打卡后，这里将显示类 GitHub 风格的热力图
        </div>
      </Card>
    </div>
  )
}

function HabitItem({ habit }: { habit: Habit }) {
  const [checked, setChecked] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border p-4 transition-colors',
        checked && 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900',
      )}
    >
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          checked
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-muted-foreground/30 hover:border-emerald-400',
        )}
      >
        {checked && <Check className="size-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.icon}</span>
          <span
            className={cn(
              'font-medium',
              checked && 'text-emerald-700 dark:text-emerald-400',
            )}
          >
            {habit.name}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {habit.targetValue} {habit.unit}
          </span>
          <span className="flex items-center gap-0.5">
            <Flame className="size-3 text-orange-500" />
            连续 {habit.currentStreak} 天
          </span>
          <span>⭐ +{habit.pointsReward}</span>
        </div>
      </div>

      {checked && (
        <span className="text-emerald-500 text-sm font-medium">已完成</span>
      )}
    </div>
  )
}

function AddHabitDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✅')
  const [targetValue, setTargetValue] = useState(1)
  const [unit, setUnit] = useState('次')
  const [points, setPoints] = useState(10)
  const addHabit = useHabitStore((s) => s.addHabit)

  const commonIcons = ['📖', '🏃', '🧘', '✍️', '💪', '🌅', '💤', '🥗', '💧', '🎯']

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    addHabit({
      name: name.trim(),
      icon,
      targetValue,
      unit,
      frequency: 'daily',
      pointsReward: points,
      isActive: true,
    })

    setName('')
    setIcon('✅')
    setTargetValue(1)
    setUnit('次')
    setPoints(10)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          新习惯
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加新习惯</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">图标</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonIcons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg border text-xl transition-colors',
                    icon === ic
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">习惯名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：阅读、运动、冥想..."
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">目标量</label>
              <Input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">单位</label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="分钟/次/字..."
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">积分</label>
              <Input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            添加习惯
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { useAppStore } from '@/stores/useAppStore'
import type { PomodoroMode } from '@/types'

const MODE_CONFIG: Record<
  PomodoroMode,
  { label: string; icon: typeof Brain; color: string }
> = {
  focus: { label: '专注', icon: Brain, color: 'text-primary' },
  short_break: { label: '短休息', icon: Coffee, color: 'text-emerald-500' },
  long_break: { label: '长休息', icon: Coffee, color: 'text-blue-500' },
}

export function PomodoroPage() {
  const {
    mode,
    isRunning,
    timeRemaining,
    completedToday,
    setMode,
    setRunning,
    setTimeRemaining,
    incrementCompleted,
    reset,
  } = usePomodoroStore()

  const pomodoroConfig = useAppStore((s) => s.config.pomodoro)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getDuration = useCallback(
    (m: PomodoroMode) => {
      switch (m) {
        case 'focus':
          return pomodoroConfig.focusDuration * 60
        case 'short_break':
          return pomodoroConfig.shortBreakDuration * 60
        case 'long_break':
          return pomodoroConfig.longBreakDuration * 60
      }
    },
    [pomodoroConfig],
  )

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isRunning) {
      setRunning(false)
      if (mode === 'focus') {
        incrementCompleted()
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [
    isRunning,
    timeRemaining,
    mode,
    setTimeRemaining,
    setRunning,
    incrementCompleted,
  ])

  const totalDuration = getDuration(mode)
  const progress =
    totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const strokeColor =
    mode === 'focus'
      ? 'stroke-primary'
      : mode === 'short_break'
        ? 'stroke-emerald-500'
        : 'stroke-blue-500'

  // SVG circle parameters
  const size = 280
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress / 100)

  function handleModeSwitch(newMode: PomodoroMode) {
    setMode(newMode)
    reset(getDuration(newMode))
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-center">番茄钟</h1>

      {/* Timer Circle */}
      <Card className="p-8 flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="-rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className="stroke-muted"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={cn(strokeColor, 'transition-all duration-1000')}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
              }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums font-mono">
              {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'mt-2 text-sm font-medium',
                MODE_CONFIG[mode].color,
              )}
            >
              {MODE_CONFIG[mode].label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => reset(getDuration(mode))}
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            size="lg"
            className="size-14 rounded-full"
            onClick={() => setRunning(!isRunning)}
          >
            {isRunning ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 ml-0.5" />
            )}
          </Button>
          <div className="size-10" /> {/* Spacer for symmetry */}
        </div>
      </Card>

      {/* Mode Switcher */}
      <Card className="p-4">
        <div className="flex gap-2">
          {(
            [
              { mode: 'focus' as const, label: '专注' },
              { mode: 'short_break' as const, label: '短休息' },
              { mode: 'long_break' as const, label: '长休息' },
            ] as const
          ).map((item) => (
            <Button
              key={item.mode}
              variant={mode === item.mode ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => handleModeSwitch(item.mode)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Today Stats */}
      <Card className="p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">今日完成</span>
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(completedToday, 12) }).map((_, i) => (
            <span key={i} className="text-lg">
              🍅
            </span>
          ))}
          {completedToday === 0 && (
            <span className="text-sm text-muted-foreground">
              还没有完成番茄
            </span>
          )}
          {completedToday > 0 && (
            <Badge variant="secondary" className="ml-2">
              {completedToday} 个
            </Badge>
          )}
        </div>
      </Card>
    </div>
  )
}

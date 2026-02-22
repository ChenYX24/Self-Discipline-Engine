import { useMemo } from 'react'
import { Moon, Sun, Monitor, Star, Zap } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { usePointsStore } from '@/stores/usePointsStore'
import { calculateLevel } from '@/lib/points'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ThemeMode } from '@/types'

export function Header() {
  const config = useAppStore((s) => s.config)
  const setTheme = useAppStore((s) => s.setTheme)
  const currentPoints = usePointsStore((s) => s.currentPoints)
  const totalPoints = usePointsStore((s) => s.totalPoints)
  const level = useMemo(() => calculateLevel(totalPoints), [totalPoints])

  const themeIcon =
    config.theme === 'dark' ? (
      <Moon className="size-4" />
    ) : config.theme === 'light' ? (
      <Sun className="size-4" />
    ) : (
      <Monitor className="size-4" />
    )

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-card/60 backdrop-blur-xl px-6">
      <div className="text-sm text-muted-foreground">
        {config.userName ? (
          <span>
            你好，
            <span className="font-medium text-foreground">
              {config.userName}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground/60">欢迎使用自律引擎</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Level + Points */}
        <Badge
          variant="secondary"
          className="gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
        >
          <Zap className="size-3 text-indigo-500" />
          Lv.{level.level}
        </Badge>

        <Badge
          variant="secondary"
          className="gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 border-amber-500/20"
        >
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {currentPoints.toLocaleString()}
        </Badge>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              {themeIcon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(
              [
                { value: 'light', icon: Sun, label: '浅色' },
                { value: 'dark', icon: Moon, label: '深色' },
                { value: 'system', icon: Monitor, label: '跟随系统' },
              ] as const
            ).map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setTheme(item.value as ThemeMode)}
              >
                <item.icon className="size-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

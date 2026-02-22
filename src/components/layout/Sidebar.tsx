import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Target,
  Timer,
  CheckSquare,
  Gift,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Eye,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { usePointsStore } from '@/stores/usePointsStore'
import { getLevelTitle, calculateLevel } from '@/lib/points'

const navGroups = [
  {
    label: '核心',
    items: [
      { to: '/', icon: LayoutDashboard, label: '仪表板' },
      { to: '/ai-planner', icon: Sparkles, label: 'AI 计划' },
      { to: '/matrix', icon: Target, label: '任务看板' },
      { to: '/pomodoro', icon: Timer, label: '番茄钟' },
    ],
  },
  {
    label: '追踪',
    items: [
      { to: '/habits', icon: CheckSquare, label: '习惯打卡' },
      { to: '/vision', icon: Eye, label: '愿景墙' },
      { to: '/shop', icon: Gift, label: '奖惩商店' },
      { to: '/stats', icon: BarChart3, label: '统计' },
    ],
  },
] as const

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const totalPoints = usePointsStore((s) => s.totalPoints)
  const currentPoints = usePointsStore((s) => s.currentPoints)
  const level = useMemo(() => calculateLevel(totalPoints), [totalPoints])
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-card/80 backdrop-blur-xl transition-all duration-300',
        'border-r border-border/50',
        collapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <span className="font-bold text-foreground tracking-tight">
            自律引擎
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {!collapsed && (
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <item.icon
                      className={cn(
                        'size-[18px] shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-border/50 px-2 py-2.5">
        {/* Level Card */}
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-3 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">
                Lv.{level.level}
              </span>
              <span className="text-muted-foreground">
                {getLevelTitle(level.level)}
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{
                  width: `${Math.round(
                    (level.currentPoints /
                      Math.max(level.currentPoints + level.pointsToNextLevel, 1)) *
                      100,
                  )}%`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{currentPoints} 积分</span>
              <span>→ Lv.{level.level + 1}</span>
            </div>
          </div>
        )}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Settings className="size-[18px] shrink-0" />
          {!collapsed && <span>设置</span>}
        </NavLink>

        {/* Collapse */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground/60 transition-all hover:bg-accent/50 hover:text-muted-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span>收起侧栏</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

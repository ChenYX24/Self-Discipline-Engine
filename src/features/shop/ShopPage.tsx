import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, Gift } from 'lucide-react'
import { usePointsStore } from '@/stores/usePointsStore'
import { getLevelTitle, getLevelProgress, calculateLevel } from '@/lib/points'

export function ShopPage() {
  const currentPoints = usePointsStore((s) => s.currentPoints)
  const totalPoints = usePointsStore((s) => s.totalPoints)
  const level = useMemo(() => calculateLevel(totalPoints), [totalPoints])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">奖惩商店</h1>

      {/* Points Panel */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Star className="size-6 fill-amber-400 text-amber-400" />
              <span className="text-3xl font-bold">
                {currentPoints.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">当前积分</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary">
              Lv.{level.level} {getLevelTitle(level.level)}
            </p>
            <div className="mt-1 w-32">
              <Progress value={getLevelProgress(level)} className="h-2" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              距下一级还需 {level.pointsToNextLevel} 分
            </p>
          </div>
        </div>
      </Card>

      {/* Placeholder for Rewards */}
      <Card className="p-12 text-center">
        <Gift className="mx-auto size-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">
          奖励商店即将开放
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          完成任务和习惯获得积分，在这里兑换你自定义的奖励
        </p>
      </Card>
    </div>
  )
}

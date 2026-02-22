import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">数据统计</h1>

      <Card className="p-12 text-center">
        <BarChart3 className="mx-auto size-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">
          统计功能开发中
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          开始使用后，这里将展示专注时长趋势、任务完成率、习惯热力图等数据
        </p>
      </Card>
    </div>
  )
}

import { Card } from '@/components/ui/card'
import { Eye } from 'lucide-react'

export function VisionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">愿景墙</h1>

      <Card className="p-12 text-center">
        <Eye className="mx-auto size-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">
          愿景墙功能开发中
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          使用 AI 计划引导生成你的反愿景、愿景和目标体系
        </p>
      </Card>
    </div>
  )
}

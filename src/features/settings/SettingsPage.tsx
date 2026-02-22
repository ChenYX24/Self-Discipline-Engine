import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/useAppStore'

export function SettingsPage() {
  const config = useAppStore((s) => s.config)
  const updateConfig = useAppStore((s) => s.updateConfig)
  const updatePomodoroConfig = useAppStore((s) => s.updatePomodoroConfig)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* Profile */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">个人信息</h2>
        <div>
          <label className="text-sm font-medium">用户名</label>
          <Input
            value={config.userName}
            onChange={(e) => updateConfig({ userName: e.target.value })}
            placeholder="输入你的名字..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">身份宣言</label>
          <Input
            value={config.identityStatement}
            onChange={(e) =>
              updateConfig({ identityStatement: e.target.value })
            }
            placeholder='例如："我是那种每天都在成长的人"'
          />
          <p className="mt-1 text-xs text-muted-foreground">
            来自 Dan Koe 方法论 — 定义你想成为的人
          </p>
        </div>
      </Card>

      {/* Pomodoro Settings */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">番茄钟</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">专注时长 (分钟)</label>
            <Input
              type="number"
              min={1}
              max={120}
              value={config.pomodoro.focusDuration}
              onChange={(e) =>
                updatePomodoroConfig({
                  focusDuration: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">短休息 (分钟)</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={config.pomodoro.shortBreakDuration}
              onChange={(e) =>
                updatePomodoroConfig({
                  shortBreakDuration: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">长休息 (分钟)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={config.pomodoro.longBreakDuration}
              onChange={(e) =>
                updatePomodoroConfig({
                  longBreakDuration: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">长休息间隔</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={config.pomodoro.longBreakInterval}
              onChange={(e) =>
                updatePomodoroConfig({
                  longBreakInterval: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">自动开始下一个</p>
            <p className="text-xs text-muted-foreground">
              休息结束后自动开始下一轮专注
            </p>
          </div>
          <Switch
            checked={config.pomodoro.autoStartNext}
            onCheckedChange={(checked) =>
              updatePomodoroConfig({ autoStartNext: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">音效</p>
            <p className="text-xs text-muted-foreground">
              番茄钟完成时播放提示音
            </p>
          </div>
          <Switch
            checked={config.pomodoro.soundEnabled}
            onCheckedChange={(checked) =>
              updatePomodoroConfig({ soundEnabled: checked })
            }
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">数据管理</h2>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            导出数据 (JSON)
          </Button>
          <Button variant="outline" size="sm">
            导入数据
          </Button>
        </div>
        <Separator />
        <div>
          <Button variant="destructive" size="sm">
            清除所有数据
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            此操作不可恢复，所有任务、习惯、积分将被删除
          </p>
        </div>
      </Card>
    </div>
  )
}

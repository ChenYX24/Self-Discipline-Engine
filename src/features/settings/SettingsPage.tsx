import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import type { AIProvider } from '@/types'

const PROVIDER_OPTIONS: {
  value: AIProvider
  label: string
  models: { value: string; label: string }[]
}[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
  },
  {
    value: 'anthropic',
    label: 'Anthropic (Claude)',
    models: [
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
  },
  {
    value: 'custom',
    label: '自定义 (OpenAI 兼容)',
    models: [{ value: 'custom', label: '自定义模型' }],
  },
]

export function SettingsPage() {
  const config = useAppStore((s) => s.config)
  const updateConfig = useAppStore((s) => s.updateConfig)
  const updateAIConfig = useAppStore((s) => s.updateAIConfig)
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

      {/* AI Config */}
      <AIConfigSection />

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

function AIConfigSection() {
  const config = useAppStore((s) => s.config)
  const updateAIConfig = useAppStore((s) => s.updateAIConfig)
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [testMessage, setTestMessage] = useState('')

  const currentProvider =
    PROVIDER_OPTIONS.find((p) => p.value === config.ai.provider) ??
    PROVIDER_OPTIONS[0]

  async function handleTestConnection() {
    if (!config.ai.apiKey.trim()) {
      setTestStatus('error')
      setTestMessage('请先输入 API Key')
      return
    }

    setTestStatus('loading')
    setTestMessage('')

    try {
      let endpoint: string
      let headers: Record<string, string>
      let body: unknown
      const base = config.ai.customEndpoint?.replace(/\/+$/, '')

      if (config.ai.provider === 'anthropic') {
        endpoint = base
          ? `${base}/messages`
          : 'https://api.anthropic.com/v1/messages'
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': config.ai.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        }
        body = {
          model: config.ai.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }
      } else {
        endpoint = base
          ? `${base}/chat/completions`
          : 'https://api.openai.com/v1/chat/completions'
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.apiKey}`,
        }
        body = {
          model: config.ai.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('text/html')) {
        throw new Error(
          '端点返回了 HTML 而非 JSON。如果在国内网络，请配置代理端点。',
        )
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(
          (err as { error?: { message?: string } }).error?.message ??
            `HTTP ${res.status}`,
        )
      }
      setTestStatus('success')
      setTestMessage(`连接成功 (${config.ai.model})`)
    } catch (err) {
      setTestStatus('error')
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setTestMessage('无法连接到端点，请检查网络或使用代理地址')
      } else {
        setTestMessage(
          err instanceof Error ? err.message : '连接失败，请检查配置',
        )
      }
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI 配置</h2>
        {config.ai.apiKey && (
          <Badge
            variant="secondary"
            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            已配置
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        配置 API Key 后，AI 规划助手将使用你的密钥调用大模型。密钥仅保存在本地浏览器中。
      </p>

      {/* Provider */}
      <div>
        <label className="text-sm font-medium">AI 服务商</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PROVIDER_OPTIONS.map((provider) => (
            <button
              key={provider.value}
              type="button"
              onClick={() => {
                updateAIConfig({
                  provider: provider.value,
                  model: provider.models[0].value,
                })
                setTestStatus('idle')
              }}
              className={cn(
                'rounded-lg border p-2.5 text-center text-xs font-medium transition-all',
                config.ai.provider === provider.value
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border hover:bg-accent/50',
              )}
            >
              {provider.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div>
        <label className="text-sm font-medium">API Key</label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={config.ai.apiKey}
              onChange={(e) => {
                updateAIConfig({ apiKey: e.target.value })
                setTestStatus('idle')
              }}
              placeholder={
                config.ai.provider === 'openai'
                  ? 'sk-...'
                  : config.ai.provider === 'anthropic'
                    ? 'sk-ant-...'
                    : '输入你的 API Key'
              }
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="text-sm font-medium">模型</label>
        {config.ai.provider === 'custom' ? (
          <Input
            value={config.ai.model}
            onChange={(e) => updateAIConfig({ model: e.target.value })}
            placeholder="输入模型名称，如 gpt-4o"
            className="mt-1"
          />
        ) : (
          <Select
            value={config.ai.model}
            onValueChange={(value) => updateAIConfig({ model: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentProvider.models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Custom Endpoint */}
      <div>
        <label className="text-sm font-medium">
          API 端点{' '}
          <span className="text-muted-foreground font-normal">(可选)</span>
        </label>
        <Input
          value={config.ai.customEndpoint ?? ''}
          onChange={(e) => {
            updateAIConfig({ customEndpoint: e.target.value })
            setTestStatus('idle')
          }}
          placeholder="https://your-proxy.com/v1"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          填写基础地址即可（如 https://api.example.com/v1），系统会自动拼接路径。
          {config.ai.provider !== 'custom' &&
            ' 留空使用官方端点。国内网络可填写代理地址。'}
        </p>
      </div>

      <Separator />

      {/* Test Connection */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={testStatus === 'loading'}
        >
          {testStatus === 'loading' && (
            <Loader2 className="size-3.5 mr-1.5 animate-spin" />
          )}
          测试连接
        </Button>

        {testStatus === 'success' && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            {testMessage}
          </span>
        )}
        {testStatus === 'error' && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <XCircle className="size-3.5" />
            {testMessage}
          </span>
        )}
      </div>
    </Card>
  )
}

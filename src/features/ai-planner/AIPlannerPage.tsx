import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Check,
  Settings,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { nanoid } from 'nanoid'
import { useNavigate } from 'react-router'

// ==================== Types ====================

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  suggestions?: Suggestion[]
  timestamp: string
}

interface Suggestion {
  id: string
  icon: string
  label: string
  description: string
}

type PlanStep =
  | 'welcome'
  | 'anti-vision'
  | 'vision'
  | 'yearly-goals'
  | 'monthly-project'
  | 'daily-levers'
  | 'complete'

const STEPS: { key: PlanStep; label: string }[] = [
  { key: 'anti-vision', label: '反愿景' },
  { key: 'vision', label: '愿景' },
  { key: 'yearly-goals', label: '年度目标' },
  { key: 'monthly-project', label: '月度项目' },
  { key: 'daily-levers', label: '每日杠杆' },
]

// ==================== Prompts & Suggestions ====================

const STEP_CONFIG: Record<
  string,
  { prompt: string; suggestions: Suggestion[] }
> = {
  welcome: {
    prompt:
      '你好！我是你的 AI 计划助手。我将通过 Dan Koe 的方法论，引导你建立清晰的目标体系。\n\n我们会经历 5 个步骤：\n1. **反愿景** — 明确你最不想要的未来\n2. **愿景** — 描绘你理想的生活\n3. **年度目标** — 设定可量化的目标\n4. **月度项目** — 聚焦当前最重要的事\n5. **每日杠杆** — 设计日常行动\n\n准备好了吗？让我们从**反愿景**开始。\n\n想象一下，如果未来 5 年你什么都不改变，你的生活会变成什么样？',
    suggestions: [
      {
        id: '1',
        icon: '💰',
        label: '财务困境',
        description: '月光族，没有存款，无法实现财务自由',
      },
      {
        id: '2',
        icon: '🏥',
        label: '健康恶化',
        description: '体重增加、精力下降、身体出现问题',
      },
      {
        id: '3',
        icon: '😔',
        label: '关系疏远',
        description: '与家人朋友越来越远，社交圈萎缩',
      },
      {
        id: '4',
        icon: '📉',
        label: '事业停滞',
        description: '还在同一个位置，没有成长和突破',
      },
    ],
  },
  'anti-vision': {
    prompt:
      '很好，你已经清楚了自己不想要的未来。这种恐惧是改变的动力。\n\n现在让我们翻转它 — **如果你能成为最好版本的自己，3 年后你的生活会是什么样子？** 描述你的理想生活。',
    suggestions: [
      {
        id: '1',
        icon: '🚀',
        label: '事业有成',
        description: '有自己的事业或技能，实现收入目标',
      },
      {
        id: '2',
        icon: '💪',
        label: '身心健康',
        description: '精力充沛，保持规律运动和健康饮食',
      },
      {
        id: '3',
        icon: '📚',
        label: '终身学习',
        description: '持续学习新技能，保持成长型思维',
      },
      {
        id: '4',
        icon: '🌟',
        label: '有影响力',
        description: '在某个领域建立个人品牌，帮助他人',
      },
    ],
  },
  vision: {
    prompt:
      '太棒了！你的愿景非常清晰。\n\n现在我需要你用一句话定义你的**身份宣言**："我是那种___的人"。然后，我们来设定 **3-5 个年度目标**，它们应该是可量化的。\n\n你今年最想达成的目标是什么？',
    suggestions: [
      {
        id: '1',
        icon: '💻',
        label: '技能提升',
        description: '学习编程/设计/写作等新技能',
      },
      {
        id: '2',
        icon: '📖',
        label: '阅读计划',
        description: '今年读完 24 本书',
      },
      {
        id: '3',
        icon: '🏃',
        label: '健身目标',
        description: '减重/增肌到目标体重',
      },
      {
        id: '4',
        icon: '💰',
        label: '收入目标',
        description: '副业月入 X 元',
      },
    ],
  },
  'yearly-goals': {
    prompt:
      '年度目标设定得很好！接下来是关键的一步 — **月度项目**。\n\n在 Dan Koe 的方法论中，月度项目就像游戏里的 "Boss战"。选择一个最能推动你年度目标的项目，用一个月集中攻克它。\n\n这个月你最想专注完成什么？',
    suggestions: [
      {
        id: '1',
        icon: '🎓',
        label: '完成课程',
        description: '学完某个在线课程或培训',
      },
      {
        id: '2',
        icon: '📝',
        label: '启动项目',
        description: '开始写博客/做视频/开副业',
      },
      {
        id: '3',
        icon: '🏋️',
        label: '运动习惯',
        description: '连续 30 天健身打卡',
      },
      {
        id: '4',
        icon: '📱',
        label: '作品输出',
        description: '完成一个作品集/Demo/MVP',
      },
    ],
  },
  'monthly-project': {
    prompt:
      '最后一步！让我们设计你的 **每日杠杆** — 这些是你每天要执行的关键行动，是推动一切前进的引擎。\n\n理想情况下设置 2-4 个每日任务，每个标注预估时间。这些将成为你四象限看板中"重要不紧急"的日常任务。\n\n你每天愿意投入多少时间在自我提升上？想做哪些事？',
    suggestions: [
      {
        id: '1',
        icon: '💻',
        label: '学习 2 小时',
        description: '编程/阅读/课程学习',
      },
      {
        id: '2',
        icon: '📖',
        label: '阅读 30 分钟',
        description: '每天读书半小时',
      },
      {
        id: '3',
        icon: '🏃',
        label: '运动 30 分钟',
        description: '跑步/健身/瑜伽',
      },
      {
        id: '4',
        icon: '✍️',
        label: '写作 30 分钟',
        description: '日记/博客/笔记',
      },
    ],
  },
}

// ==================== Component ====================

export function AIPlannerPage() {
  const apiKey = useAppStore((s) => s.config.ai.apiKey)
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<PlanStep>('welcome')
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const config = STEP_CONFIG['welcome']
    return [
      {
        id: nanoid(),
        role: 'assistant',
        content: config.prompt,
        suggestions: config.suggestions,
        timestamp: new Date().toISOString(),
      },
    ]
  })
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)

  const advanceStep = useCallback(() => {
    const nextStepIndex = stepIndex + 1
    if (nextStepIndex >= STEPS.length) {
      setCurrentStep('complete')
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: 'assistant',
          content:
            '恭喜你完成了所有步骤！🎉\n\n你已经建立了完整的目标体系：反愿景 → 愿景 → 年度目标 → 月度项目 → 每日杠杆。\n\n现在你可以去**任务看板**开始添加今天的任务，或者去**习惯打卡**页面设置你的日常习惯。\n\n记住：**"我是那种每天都在精进的人"**。',
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    const nextStep = STEPS[nextStepIndex]
    const config = STEP_CONFIG[nextStep.key]
    setCurrentStep(nextStep.key)

    if (config) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            content: config.prompt,
            suggestions: config.suggestions,
            timestamp: new Date().toISOString(),
          },
        ])
      }, 600)
    }
  }, [stepIndex])

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim()) return

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: 'user',
          content: text.trim(),
          timestamp: new Date().toISOString(),
        },
      ])
      setInputValue('')

      // If has API key, call AI. Otherwise use template responses.
      if (apiKey) {
        callAI(text.trim())
      } else {
        // Template mode: advance to next step after a delay
        setIsStreaming(true)
        setTimeout(() => {
          setIsStreaming(false)
          advanceStep()
        }, 800)
      }
    },
    [apiKey, advanceStep],
  )

  const callAI = useCallback(
    async (userMessage: string) => {
      const config = useAppStore.getState().config.ai
      setIsStreaming(true)

      try {
        const systemPrompt = `你是一个自律计划助手，基于Dan Koe的方法论引导用户建立目标体系。当前步骤：${currentStep}。保持回复简洁(2-3段)，鼓励性的语气，然后引导用户进入下一步。用中文回复。`

        const apiMessages = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }))

        apiMessages.push({ role: 'user', content: userMessage })

        let endpoint: string
        let headers: Record<string, string>
        let body: unknown
        const base = config.customEndpoint?.replace(/\/+$/, '')

        if (config.provider === 'anthropic') {
          endpoint = base
            ? `${base}/messages`
            : 'https://api.anthropic.com/v1/messages'
          headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          }
          body = {
            model: config.model || 'claude-sonnet-4-5-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: apiMessages,
          }
        } else {
          endpoint = base
            ? `${base}/chat/completions`
            : 'https://api.openai.com/v1/chat/completions'
          headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          }
          body = {
            model: config.model || 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              ...apiMessages,
            ],
            max_tokens: 1024,
          }
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        const contentType = response.headers.get('content-type') ?? ''
        if (contentType.includes('text/html')) {
          throw new Error(
            '端点返回了 HTML 而非 JSON，请在设置中配置代理端点',
          )
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const errMsg =
            (errData as { error?: { message?: string } }).error?.message ??
            `HTTP ${response.status}`
          throw new Error(errMsg)
        }

        const data = await response.json()
        let assistantContent: string

        if (config.provider === 'anthropic') {
          assistantContent = data.content?.[0]?.text ?? '(无回复)'
        } else {
          assistantContent =
            data.choices?.[0]?.message?.content ?? '(无回复)'
        }

        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          },
        ])

        // Auto-advance after AI response
        setTimeout(() => advanceStep(), 1500)
      } catch (err) {
        let errorMsg: string
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          errorMsg =
            '无法连接到 API 端点。如果在国内网络，请在设置中配置代理端点地址。'
        } else {
          errorMsg = err instanceof Error ? err.message : '未知错误'
        }

        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            content: `API 调用出错：${errorMsg}\n\n你可以在**设置**页面检查 API Key 和端点配置，或继续使用模板模式。`,
            timestamp: new Date().toISOString(),
          },
        ])
        // Still advance
        setTimeout(() => advanceStep(), 2000)
      } finally {
        setIsStreaming(false)
      }
    },
    [currentStep, messages, advanceStep],
  )

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      handleSend(`${suggestion.icon} ${suggestion.label}：${suggestion.description}`)
    },
    [handleSend],
  )

  const handleReset = useCallback(() => {
    const config = STEP_CONFIG['welcome']
    setCurrentStep('welcome')
    setMessages([
      {
        id: nanoid(),
        role: 'assistant',
        content: config.prompt,
        suggestions: config.suggestions,
        timestamp: new Date().toISOString(),
      },
    ])
  }, [])

  return (
    <div className="mx-auto max-w-3xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AI 计划引导</h1>
          <p className="text-sm text-muted-foreground">
            {apiKey
              ? '已连接 AI — 智能对话模式'
              : '模板模式 — 在设置中配置 API Key 启用 AI'}
          </p>
        </div>
        <div className="flex gap-2">
          {!apiKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="size-4 mr-1.5" />
              配置 AI
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4 mr-1.5" />
            重新开始
          </Button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="mb-4 flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isCompleted = stepIndex > i
          const isCurrent =
            step.key === currentStep ||
            (currentStep === 'welcome' && i === 0)
          const isUpcoming = stepIndex < i && currentStep !== 'complete'

          return (
            <div key={step.key} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                  isCompleted &&
                    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                  isCurrent && 'bg-primary/15 text-primary',
                  isUpcoming && 'text-muted-foreground/40',
                  currentStep === 'complete' &&
                    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                )}
              >
                {isCompleted || currentStep === 'complete' ? (
                  <Check className="size-3" />
                ) : (
                  <span className="size-3 text-center text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="size-3 text-muted-foreground/30 shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Message Bubble */}
              <div
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' && 'flex-row-reverse',
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold',
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-accent text-foreground',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <Sparkles className="size-4" />
                  ) : (
                    '我'
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'assistant'
                      ? 'bg-accent/50 rounded-tl-md'
                      : 'bg-primary text-primary-foreground rounded-tr-md',
                  )}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line.startsWith('**') ? (
                        <strong>
                          {line.replace(/\*\*/g, '')}
                        </strong>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 ml-11 flex flex-wrap gap-2">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s)}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <p className="text-xs font-semibold">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex gap-3">
              <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="size-4 text-white animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-accent/50 px-4 py-3">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.15s]" />
                  <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {currentStep !== 'complete' && (
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(inputValue)
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入你的想法..."
                disabled={isStreaming}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isStreaming}
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Complete Actions */}
        {currentStep === 'complete' && (
          <div className="border-t border-border p-4 flex gap-3">
            <Button
              className="flex-1"
              onClick={() => navigate('/matrix')}
            >
              去任务看板
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/habits')}
            >
              设置习惯
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

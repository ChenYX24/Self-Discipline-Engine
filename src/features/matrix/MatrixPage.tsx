import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  GripVertical,
  Clock,
  Trash2,
  MoreHorizontal,
  Circle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTaskStore, getTodayDateString } from '@/stores/useTaskStore'
import type { QuadrantType, Task, TaskStatus } from '@/types'

const STATUS_COLUMNS: {
  status: TaskStatus
  label: string
  icon: typeof Circle
  color: string
  bgColor: string
}[] = [
  {
    status: 'todo',
    label: '未开始',
    icon: Circle,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
  },
  {
    status: 'in_progress',
    label: '进行中',
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    status: 'done',
    label: '已完成',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
]

const QUADRANT_CONFIG: Record<
  QuadrantType,
  { label: string; shortLabel: string; color: string; dot: string }
> = {
  'urgent-important': {
    label: '重要且紧急',
    shortLabel: '紧急',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
    dot: 'bg-red-500',
  },
  'not-urgent-important': {
    label: '重要不紧急',
    shortLabel: '计划',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  'urgent-not-important': {
    label: '不重要但紧急',
    shortLabel: '委托',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dot: 'bg-blue-500',
  },
  'not-urgent-not-important': {
    label: '不重要不紧急',
    shortLabel: '推迟',
    color: 'bg-slate-500/15 text-slate-500 border-slate-500/20',
    dot: 'bg-slate-400',
  },
}

export function MatrixPage() {
  const today = getTodayDateString()
  const allTasks = useTaskStore((s) => s.tasks)
  const setStatus = useTaskStore((s) => s.setStatus)
  const removeTask = useTaskStore((s) => s.removeTask)

  const tasks = useMemo(
    () => allTasks.filter((t) => t.date === today),
    [allTasks, today],
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeTask = tasks.find((t) => t.id === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
      cancelled: [],
    }
    for (const task of tasks) {
      grouped[task.status]?.push(task)
    }
    return grouped
  }, [tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const taskId = active.id as string
      const overId = over.id as string

      // Check if dropped on a column
      const targetColumn = STATUS_COLUMNS.find((c) => c.status === overId)
      if (targetColumn) {
        setStatus(taskId, targetColumn.status)
        return
      }

      // Dropped on another task — move to that task's status
      const targetTask = tasks.find((t) => t.id === overId)
      if (targetTask && targetTask.id !== taskId) {
        setStatus(taskId, targetTask.status)
      }
    },
    [tasks, setStatus],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任务看板</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            拖拽任务卡片来切换状态
          </p>
        </div>
        <AddTaskDialog />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {STATUS_COLUMNS.map((col) => (
            <StatusColumn
              key={col.status}
              column={col}
              tasks={tasksByStatus[col.status] ?? []}
              onRemove={removeTask}
              onStatusChange={setStatus}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function StatusColumn({
  column,
  tasks,
  onRemove,
  onStatusChange,
}: {
  column: (typeof STATUS_COLUMNS)[number]
  tasks: Task[]
  onRemove: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const { setNodeRef } = useSortable({ id: column.status })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-xl border border-border/50 bg-accent/30 p-3"
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center gap-2">
        <column.icon className={cn('size-4', column.color)} />
        <span className="text-sm font-semibold">{column.label}</span>
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          {tasks.length}
        </Badge>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 min-h-[120px]">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onRemove={() => onRemove(task.id)}
              onStatusChange={onStatusChange}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-border/50">
              <span className="text-xs text-muted-foreground/50">
                拖拽到这里
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableTaskCard({
  task,
  onRemove,
  onStatusChange,
}: {
  task: Task
  onRemove: () => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isDone = task.status === 'done'
  const qConfig = QUADRANT_CONFIG[task.quadrant]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-40',
        isDone && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              isDone && 'line-through text-muted-foreground',
            )}
          >
            {task.title}
          </p>

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {/* Quadrant Badge */}
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 border', qConfig.color)}
            >
              <div className={cn('size-1.5 rounded-full mr-1', qConfig.dot)} />
              {qConfig.shortLabel}
            </Badge>

            {task.estimatedPomodoros > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            )}
            {task.pointsReward > 0 && (
              <span className="text-[10px] text-amber-500 font-medium">
                +{task.pointsReward}
              </span>
            )}
            {task.dueTime && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-3" />
                {task.dueTime}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {STATUS_COLUMNS.filter((c) => c.status !== task.status).map(
              (col) => (
                <DropdownMenuItem
                  key={col.status}
                  onClick={() => onStatusChange(task.id, col.status)}
                >
                  <col.icon className={cn('size-3.5 mr-2', col.color)} />
                  {col.label}
                </DropdownMenuItem>
              ),
            )}
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function TaskCardOverlay({ task }: { task: Task }) {
  const qConfig = QUADRANT_CONFIG[task.quadrant]

  return (
    <div className="rounded-lg border bg-card p-3 shadow-xl w-[280px] rotate-2">
      <div className="flex items-start gap-2">
        <GripVertical className="size-4 mt-0.5 text-muted-foreground/40" />
        <div className="flex-1">
          <p className="text-sm font-medium">{task.title}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 border', qConfig.color)}
            >
              {qConfig.shortLabel}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState<QuadrantType>('not-urgent-important')
  const [points, setPoints] = useState(10)
  const [pomodoros, setPomodoros] = useState(1)
  const addTask = useTaskStore((s) => s.addTask)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    addTask({
      title: title.trim(),
      quadrant,
      status: 'todo',
      date: getTodayDateString(),
      estimatedPomodoros: pomodoros,
      pointsReward: points,
      tags: [],
      order: Date.now(),
    })

    setTitle('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          新任务
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加新任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">任务标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务名称..."
              autoFocus
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">优先级</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.entries(QUADRANT_CONFIG) as [QuadrantType, typeof QUADRANT_CONFIG[QuadrantType]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuadrant(key)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-all',
                      quadrant === key
                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:bg-accent/50',
                    )}
                  >
                    <div className={cn('size-2 rounded-full', config.dot)} />
                    <span className="font-medium">{config.label}</span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">番茄数</label>
              <Input
                type="number"
                min={0}
                max={20}
                value={pomodoros}
                onChange={(e) => setPomodoros(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">积分</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            添加任务
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

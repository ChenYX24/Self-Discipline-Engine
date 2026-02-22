import { BrowserRouter, Routes, Route } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MatrixPage } from '@/features/matrix/MatrixPage'
import { PomodoroPage } from '@/features/pomodoro/PomodoroPage'
import { HabitsPage } from '@/features/habits/HabitsPage'
import { ShopPage } from '@/features/shop/ShopPage'
import { StatsPage } from '@/features/stats/StatsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { VisionPage } from '@/features/vision/VisionPage'
import { AIPlannerPage } from '@/features/ai-planner/AIPlannerPage'
import { useDarkMode } from '@/hooks/useDarkMode'

export default function App() {
  useDarkMode()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="ai-planner" element={<AIPlannerPage />} />
          <Route path="vision" element={<VisionPage />} />
          <Route path="matrix" element={<MatrixPage />} />
          <Route path="pomodoro" element={<PomodoroPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

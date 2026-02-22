import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Reward, Punishment, UserLevel } from '@/types'
import { calculateLevel } from '@/types'
import { nanoid } from 'nanoid'

interface PointsStore {
  totalPoints: number
  currentPoints: number
  rewards: Reward[]
  punishments: Punishment[]
  addPoints: (amount: number) => void
  deductPoints: (amount: number) => void
  addReward: (
    reward: Omit<Reward, 'id' | 'createdAt' | 'timesRedeemed'>,
  ) => void
  addPunishment: (punishment: Omit<Punishment, 'id' | 'createdAt'>) => void
  redeemReward: (id: string) => boolean
  removeReward: (id: string) => void
  removePunishment: (id: string) => void
  getUserLevel: () => UserLevel
}

export const usePointsStore = create<PointsStore>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      currentPoints: 0,
      rewards: [],
      punishments: [],

      addPoints: (amount) =>
        set((state) => ({
          totalPoints: state.totalPoints + amount,
          currentPoints: state.currentPoints + amount,
        })),

      deductPoints: (amount) =>
        set((state) => ({
          currentPoints: Math.max(0, state.currentPoints - amount),
        })),

      addReward: (rewardData) =>
        set((state) => ({
          rewards: [
            ...state.rewards,
            {
              ...rewardData,
              id: nanoid(),
              timesRedeemed: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      addPunishment: (punishmentData) =>
        set((state) => ({
          punishments: [
            ...state.punishments,
            {
              ...punishmentData,
              id: nanoid(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      redeemReward: (id) => {
        const state = get()
        const reward = state.rewards.find((r) => r.id === id)
        if (!reward || state.currentPoints < reward.cost) return false

        set({
          currentPoints: state.currentPoints - reward.cost,
          rewards: state.rewards.map((r) =>
            r.id === id ? { ...r, timesRedeemed: r.timesRedeemed + 1 } : r,
          ),
        })
        return true
      },

      removeReward: (id) =>
        set((state) => ({
          rewards: state.rewards.filter((r) => r.id !== id),
        })),

      removePunishment: (id) =>
        set((state) => ({
          punishments: state.punishments.filter((p) => p.id !== id),
        })),

      getUserLevel: () => calculateLevel(get().totalPoints),
    }),
    {
      name: 'points-store',
    },
  ),
)

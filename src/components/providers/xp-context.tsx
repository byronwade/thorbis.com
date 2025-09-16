'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-context'
import { supabase } from '@/lib/supabase-client'

// Types
export interface XPTransaction {
  id: string
  amount: number
  reason: string
  source_type: string
  source_id?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  conditions: Record<string, unknown>
  is_active: boolean
}

export interface UserBadge {
  id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

export interface UserStats {
  level: number
  total_xp: number
  streak_days: number
  longest_streak: number
  badges: UserBadge[]
  recent_transactions: XPTransaction[]
}

interface XPContextType {
  userStats: UserStats | null
  loading: boolean
  error: string | null
  awardXP: (amount: number, reason: string, sourceType: string, sourceId?: string) => Promise<boolean>
  checkAndAwardBadges: () => Promise<void>
  refreshStats: () => Promise<void>
  getXPForLevel: (level: number) => number
  getXPToNextLevel: () => number
  getLevelProgress: () => number
}

const XPContext = createContext<XPContextType | null>(null)

export function useXP() {
  const context = useContext(XPContext)
  if (!context) {
    throw new Error('useXP must be used within an XPProvider')
  }
  return context
}

export function XPProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // XP calculation functions
  const getXPForLevel = useCallback((level: number): number => {
    // Exponential XP requirements: level 1 = 0 XP, level 2 = 1000 XP, level 3 = 2500 XP, etc.
    if (level <= 1) return 0
    return Math.floor(((level - 1) ** 1.5) * 1000)
  }, [])

  const getXPToNextLevel = useCallback((): number => {
    if (!userStats) return 0
    const currentLevelXP = getXPForLevel(userStats.level)
    const nextLevelXP = getXPForLevel(userStats.level + 1)
    return nextLevelXP - userStats.total_xp
  }, [userStats, getXPForLevel])

  const getLevelProgress = useCallback((): number => {
    if (!userStats) return 0
    const currentLevelXP = getXPForLevel(userStats.level)
    const nextLevelXP = getXPForLevel(userStats.level + 1)
    const progress = ((userStats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.max(0, Math.min(100, progress))
  }, [userStats, getXPForLevel])

  // Fetch user stats including XP, level, badges, and recent transactions
  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Fetch user profile with XP and level info
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('level, total_xp, streak_days, longest_streak')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch user badges with badge details
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('
          id,
          badge_id,
          earned_at,
          badges:badge_id (
            id,
            name,
            description,
            icon,
            rarity,
            conditions,
            is_active
          )
        ')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (badgesError) throw badgesError

      // Fetch recent XP transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('xp_transactions')
        .select('id, amount, reason, source_type, source_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) throw transactionsError

      // Format the data
      const formattedBadges: UserBadge[] = badgesData.map(ub => ({
        id: ub.id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        badge: ub.badges[0] as Badge
      }))

      setUserStats({
        level: profileData.level || 1,
        total_xp: profileData.total_xp || 0,
        streak_days: profileData.streak_days || 0,
        longest_streak: profileData.longest_streak || 0,
        badges: formattedBadges,
        recent_transactions: transactionsData || []
      })
    } catch (err) {
      console.error('Error fetching user stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user stats')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Award XP to user and update level if necessary
  const awardXP = useCallback(async (
    amount: number,
    reason: string,
    sourceType: string,
    sourceId?: string
  ): Promise<boolean> => {
    if (!user?.id || amount <= 0) return false

    try {
      // Call the database function to update XP and level
      const { error } = await supabase.rpc('update_user_xp', {
        user_id_param: user.id,
        xp_to_add: amount
      })

      if (error) throw error

      // Refresh user stats
      await fetchUserStats()
      
      // Check for new badges after XP award
      await checkAndAwardBadges()

      return true
    } catch (err) {
      console.error('Error awarding XP:', err)
      setError(err instanceof Error ? err.message : 'Failed to award XP')
      return false
    }
  }, [user?.id, fetchUserStats])

  // Check and award badges based on current user stats
  const checkAndAwardBadges = useCallback(async () => {
    if (!user?.id || !userStats) return

    try {
      // Fetch all available badges
      const { data: availableBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)

      if (badgesError) throw badgesError

      // Get user's current badges'
      const userBadgeIds = userStats.badges.map(ub => ub.badge_id)

      // Check each badge condition
      for (const badge of availableBadges) {
        if (userBadgeIds.includes(badge.id)) continue // Already has badge

        let shouldAward = false
        const conditions = badge.conditions as Record<string, unknown>

        // Example badge conditions (can be expanded)
        if (conditions.type === 'xp_milestone' && conditions.amount) {
          shouldAward = userStats.total_xp >= conditions.amount
        } else if (conditions.type === 'level_milestone' && conditions.level) {
          shouldAward = userStats.level >= conditions.level
        } else if (conditions.type === 'streak_milestone' && conditions.days) {
          shouldAward = userStats.streak_days >= conditions.days
        }

        // Award the badge
        if (shouldAward) {
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: badge.id
            })

          if (error && !error.message.includes('duplicate key')) {
            console.error('Error awarding badge:', error)
          }
        }
      }

      // Refresh stats to include new badges
      await fetchUserStats()
    } catch (err) {
      console.error('Error checking badges:', err)
    }
  }, [user?.id, userStats, fetchUserStats])

  // Refresh stats manually
  const refreshStats = useCallback(async () => {
    await fetchUserStats()
  }, [fetchUserStats])

  // Load initial stats
  useEffect(() => {
    if (user?.id) {
      fetchUserStats()
    } else {
      setUserStats(null)
      setLoading(false)
    }
  }, [user?.id, fetchUserStats])

  return (
    <XPContext.Provider value={{
      userStats,
      loading,
      error,
      awardXP,
      checkAndAwardBadges,
      refreshStats,
      getXPForLevel,
      getXPToNextLevel,
      getLevelProgress
    }}>
      {children}
    </XPContext.Provider>
  )
}
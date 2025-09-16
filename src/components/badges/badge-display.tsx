'use client'

import { Badge } from '@/components/ui/badge';
import React from 'react'
import { Badge as BadgeType, UserBadge } from '@/contexts/xp-context'

import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trophy, Star, Crown, Gem, Diamond } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface BadgeDisplayProps {
  badge: BadgeType | UserBadge
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  showEarnedDate?: boolean
  className?: string
}

const rarityConfig = {
  Common: {
    icon: Trophy,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  },
  Uncommon: {
    icon: Star,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  Rare: {
    icon: Crown,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  Epic: {
    icon: Gem,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  Legendary: {
    icon: Diamond,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300'
  }
}

const sizeConfig = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-xs'
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-sm'
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10',
    text: 'text-base'
  }
}

export function BadgeDisplay({ 
  badge, 
  size = 'md', 
  showDetails = false, 
  showEarnedDate = false,
  className 
}: BadgeDisplayProps) {
  // Handle both Badge and UserBadge types
  const badgeData = 'badge' in badge ? badge.badge : badge
  const earnedAt = 'earned_at' in badge ? badge.earned_at : null
  
  const rarity = rarityConfig[badgeData.rarity]
  const sizes = sizeConfig[size]
  const IconComponent = rarity.icon

  const badgeContent = (
    <div className={cn(
      'relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-105',
      sizes.container,
      rarity.bgColor,
      rarity.borderColor,
      className
    )}>
      <IconComponent className={cn(sizes.icon, rarity.color)} />
      
      {size === 'lg' && (
        <div className={cn('mt-1 font-medium text-center', sizes.text, rarity.color)}>
          {badgeData.name}
        </div>
      )}

      {/* Rarity indicator */}
      <div className={cn(
        'absolute -top-1 -right-1 w-3 h-3 rounded-full',
        rarity.bgColor,
        rarity.borderColor,
        'border'
      )} />
    </div>
  )

  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold mb-1">{badgeData.name}</div>
      <div className="text-sm text-gray-600 mb-2">{badgeData.description}</div>
      
      <Badge variant="secondary">
        {badgeData.rarity}
      </Badge>
      
      {earnedAt && showEarnedDate && (
        <div className="text-xs text-gray-500 mt-2">
          Earned {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
        </div>
      )}
    </div>
  )

  if (showDetails) {
    return (
      <div className={cn('p-4 border rounded-lg bg-white', className)}>
        <div className="flex items-center space-x-4">
          <div className={cn(
            'flex items-center justify-center rounded-xl border-2',
            'w-16 h-16',
            rarity.bgColor,
            rarity.borderColor
          )}>
            <IconComponent className={cn('w-8 h-8', rarity.color)} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{badgeData.name}</h3>
              <Badge variant="secondary">
                {badgeData.rarity}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{badgeData.description}</p>
            
            {earnedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Earned {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface BadgeGridProps {
  badges: UserBadge[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BadgeGrid({ badges, maxDisplay, size = 'md', className }: BadgeGridProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayBadges.map((userBadge) => (
        <BadgeDisplay
          key={userBadge.id}
          badge={userBadge}
          size={size}
          showEarnedDate={true}
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={cn(
          'flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500',
          sizeConfig[size].container,
          sizeConfig[size].text
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

interface XPProgressBarProps {
  currentXP: number
  level: number
  getXPForLevel: (level: number) => number
  className?: string
}

export function XPProgressBar({ currentXP, level, getXPForLevel, className }: XPProgressBarProps) {
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const progressXP = currentXP - currentLevelXP
  const requiredXP = nextLevelXP - currentLevelXP
  const progress = (progressXP / requiredXP) * 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Level {level}</span>
        <span className="text-xs text-gray-500">
          {progressXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
        </span>
      </div>
      
      <Progress value={Math.max(0, Math.min(100, progress))} className="h-3" />
      
      <div className="text-xs text-gray-500 text-center">
        {(requiredXP - progressXP).toLocaleString()} XP to next level
      </div>
    </div>
  )
}

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizes = sizeConfig[size]
  
  // Color based on level ranges
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-300'
  if (level >= 50) {
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-300'
  } else if (level >= 25) {
    colorClass = 'bg-purple-100 text-purple-700 border-purple-300'
  } else if (level >= 10) {
    colorClass = 'bg-blue-100 text-blue-700 border-blue-300'
  } else if (level >= 5) {
    colorClass = 'bg-green-100 text-green-700 border-green-300'
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full border-2 font-bold',
      sizes.container,
      sizes.text,
      colorClass,
      className
    )}>
      {level}
    </div>
  )
}
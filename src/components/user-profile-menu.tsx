'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'

interface UserProfileMenuProps {
  user?: {
    name: string
    email: string
    role?: string
    avatar?: string
  }
  onUserMenuAction?: (action: 'profile' | 'settings' | 'logout') => void
  className?: string
}

export function UserProfileMenu({ 
  user = { name: 'Byron Wade', email: 'byron@thorbis.com', role: 'Administrator' },
  onUserMenuAction,
  className = ''
}: UserProfileMenuProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleMenuAction = (action: 'profile' | 'settings' | 'logout') => {
    onUserMenuAction?.(action)
    setUserMenuOpen(false)
  }

  // Generate user avatar initials
  const userInitials = user.name
    .split(' ')
    .map(word => word[0])
    .join(')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={'relative ${className}'} ref={dropdownRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-primary-foreground font-semibold text-xs">{userInitials}</span>
          )}
        </div>
        <ChevronDown className={'h-3 w-3 transition-transform ${userMenuOpen ? 'rotate-180' : '
              }'} />'
      </button>

      {/* Dropdown Menu */}
      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-2">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.role && (
              <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuAction('profile')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => handleMenuAction('settings')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => handleMenuAction('logout')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:text-destructive hover:bg-muted/50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
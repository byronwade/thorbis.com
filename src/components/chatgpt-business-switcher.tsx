'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

interface Business {
  id: string
  name: string
  type: 'ai' | 'home-services' | 'restaurant' | 'automotive' | 'retail' | 'books' | 'courses' | 'investigations' | 'payroll' | 'banking'
  isActive?: boolean
}

interface ChatGPTBusinessSwitcherProps {
  currentBusiness?: Business
  businesses?: Business[]
  onBusinessSwitch?: (business: Business) => void
  className?: string
}

// Generate avatar initials and colors for businesses
const getBusinessAvatar = (business: Business) => {
  const initials = business.name
    .split(' ')
    .map(word => word[0])
    .join(')
    .toUpperCase()
    .slice(0, 2)

  // Color schemes for different business types
  const colorSchemes = {
    'ai': 'bg-cyan-600 text-white',
    'home-services': 'bg-blue-600 text-white',
    'restaurant': 'bg-orange-600 text-white',
    'automotive': 'bg-green-600 text-white',
    'retail': 'bg-purple-600 text-white',
    'books': 'bg-emerald-600 text-white',
    'courses': 'bg-indigo-600 text-white',
    'investigations': 'bg-red-600 text-white',
    'payroll': 'bg-yellow-600 text-white',
    'banking': 'bg-teal-600 text-white'
  }

  return {
    initials,
    colorClass: colorSchemes[business.type] || 'bg-gray-600 text-white'
  }
}

const businessTypeLabels = {
  'ai': 'AI Assistant',
  'home-services': 'Home Services',
  'restaurant': 'Restaurant',
  'automotive': 'Automotive',
  'retail': 'Retail',
  'books': 'Accounting',
  'courses': 'Learning',
  'investigations': 'Investigations',
  'payroll': 'Payroll',
  'banking': 'Banking'
}


export function ChatGPTBusinessSwitcher({
  currentBusiness,
  businesses = [],
  onBusinessSwitch,
  className = ''
}: ChatGPTBusinessSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleBusinessSelect = (business: Business) => {
    onBusinessSwitch?.(business)
    setIsOpen(false)
  }

  if (!currentBusiness) return null

  const currentAvatar = getBusinessAvatar(currentBusiness)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors min-w-0"
      >
        <div className={'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${currentAvatar.colorClass}'}>
          {currentAvatar.initials}
        </div>
        <span className="truncate">{currentBusiness.name}</span>
        <ChevronDown className={'h-3 w-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : '
              }'} />'
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-2">
          {/* Current Businesses */}
          <div className="px-3 py-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">Switch Business</div>
            <div className="space-y-1">
              {businesses.map((business) => {
                const businessAvatar = getBusinessAvatar(business)
                const isCurrentBusiness = business.id === currentBusiness?.id
                
                return (
                  <button
                    key={business.id}
                    onClick={() => handleBusinessSelect(business)}
                    className={'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                      isCurrentBusiness
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-foreground hover:bg-muted/50`
              }`}'
                  >
                    <div className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${businessAvatar.colorClass}'}>
                      {businessAvatar.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{business.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {businessTypeLabels[business.type]}
                      </div>
                    </div>
                    {isCurrentBusiness && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Create New Business */}
          <div className="border-t border-border mt-2 pt-2 px-3">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Create new business</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
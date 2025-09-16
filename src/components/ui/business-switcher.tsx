'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Building2, Wrench, ChefHat, Car, ShoppingCart, Plus, Check, Zap, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Business {
  id: string
  name: string
  type: 'home-services' | 'restaurant' | 'automotive' | 'retail'
  logo?: string
  isActive?: boolean
}

export interface BusinessType {
  key: 'home-services' | 'restaurant' | 'automotive' | 'retail'
  label: string
  icon: React.ElementType
  description: string
  features: string[]
  color: string
}

const businessTypes: BusinessType[] = [
  {
    key: 'home-services',
    label: 'Home Services',
    icon: Wrench,
    description: 'Field service management for plumbers, electricians, HVAC, and more',
    features: ['Work Order Management', 'Dispatch & Scheduling', 'Customer Management', 'Estimates & Invoicing', 'Mobile Workforce'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    key: 'restaurant',
    label: 'Restaurant',
    icon: ChefHat,
    description: 'Complete restaurant management from POS to kitchen operations',
    features: ['Point of Sale', 'Kitchen Display', 'Menu Management', 'Reservations', 'Inventory Control'],
    color: 'from-slate-400 to-slate-600'
  },
  {
    key: 'automotive',
    label: 'Automotive',
    icon: Car,
    description: 'Auto shop management for repairs, maintenance, and parts',
    features: ['Service Bays', 'Repair Orders', 'Parts Inventory', 'Vehicle History', 'Customer Portal'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    key: 'retail',
    label: 'Retail',
    icon: ShoppingCart,
    description: 'Retail operations management for stores and e-commerce',
    features: ['Point of Sale', 'Inventory Management', 'Customer Orders', 'Product Catalog', 'Multi-Channel Sales'],
    color: 'from-slate-400 to-slate-600'
  }
]

interface BusinessSwitcherProps {
  currentBusiness?: Business
  businesses?: Business[]
  onBusinessSwitch?: (business: Business) => void
  onCreateBusiness?: (type: BusinessType['key']) => void
  className?: string
}

export function BusinessSwitcher({
  currentBusiness,
  businesses = [],
  onBusinessSwitch,
  onCreateBusiness,
  className
}: BusinessSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<BusinessType['key'] | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedType(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get businesses by type
  const getBusinessesByType = (type: BusinessType['key']) => {
    return businesses.filter(business => business.type === type)
  }

  // Get current business type
  const currentBusinessType = currentBusiness 
    ? businessTypes.find(type => type.key === currentBusiness.type)
    : businessTypes[0]

  const handleBusinessSelect = (business: Business) => {
    onBusinessSwitch?.(business)
    setIsOpen(false)
    setSelectedType(null)
  }

  const handleCreateBusiness = (type: BusinessType['key']) => {
    onCreateBusiness?.(type)
    setIsOpen(false)
    setSelectedType(null)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ease-out",
          "bg-white/5 backdrop-blur-sm border border-white/10 text-white",
          "hover:bg-white/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10",
          "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50",
          "active:scale-98 transform",
          isOpen && "border-blue-400/50 bg-white/10 shadow-xl shadow-blue-500/20"
        )}
      >
        {currentBusinessType && (
          <div className="relative">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
              "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg",
              "group-hover:shadow-blue-500/50 group-hover:scale-105"
            )}>
              <currentBusinessType.icon className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-80 animate-pulse" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate tracking-tight">
            {currentBusiness?.name || 'Select Business'}
          </div>
          <div className="text-xs text-slate-400 truncate font-medium">
            {currentBusinessType?.label}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            isOpen ? "bg-blue-400 animate-pulse" : "bg-slate-500"
          )} />
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 ease-out",
              isOpen && "rotate-180 text-blue-400"
            )} 
          />
        </div>
      </button>

      {/* Full-width Mega Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-40" />
          
          {/* Dropdown */}
          <div className="fixed left-0 right-0 top-20 z-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-neutral-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                  {businessTypes.map((type) => {
                    const typeBusinesses = getBusinessesByType(type.key)
                    const isSelected = selectedType === type.key
                    const hasBusinesses = typeBusinesses.length > 0

                    return (
                      <div
                        key={type.key}
                        className={cn(
                          "relative p-6 transition-all duration-300 cursor-pointer border-r border-white/5 last:border-r-0",
                          "hover:bg-white/5 group backdrop-blur-sm",
                          isSelected && "bg-white/5"
                        )}
                        onMouseEnter={() => setSelectedType(type.key)}
                      >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/5 group-hover:to-blue-600/5 transition-all duration-500" />
                        
                        {/* Business Type Header */}
                        <div className="relative flex items-start gap-3 mb-5">
                          <div className="relative">
                            <div className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-lg",
                              `bg-gradient-to-br ${type.color}',
                              "group-hover:scale-110 group-hover:shadow-blue-500/30"
                            )}>
                              <type.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4">
                              <Circle className="w-4 h-4 text-blue-400 opacity-60 animate-ping" />
                              <Circle className="absolute inset-0 w-4 h-4 text-blue-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-base tracking-tight mb-1">
                              {type.label}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                              {hasBusinesses ? '${typeBusinesses.length} active' : 'No businesses'}
                            </p>
                          </div>
                        </div>

                        {/* Business List */}
                        <div className="relative space-y-2 mb-5">
                          {typeBusinesses.map((business) => (
                            <button
                              key={business.id}
                              onClick={() => handleBusinessSelect(business)}
                              className={cn(
                                "relative w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all duration-300",
                                "hover:bg-white/5 text-slate-300 hover:text-white group/item",
                                "border border-transparent hover:border-white/10",
                                currentBusiness?.id === business.id && "bg-blue-500/10 text-blue-400 border-blue-400/30 shadow-lg shadow-blue-500/10"
                              )}
                            >
                              <div className="relative flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-300",
                                  currentBusiness?.id === business.id 
                                    ? "bg-blue-400 shadow-lg shadow-blue-400/50" 
                                    : "bg-slate-600 group-hover/item:bg-blue-400"
                                )} />
                                <span className="text-sm font-semibold truncate">{business.name}</span>
                              </div>
                              {currentBusiness?.id === business.id && (
                                <div className="relative">
                                  <Check className="w-4 h-4 text-blue-400" />
                                  <div className="absolute inset-0 animate-pulse">
                                    <Check className="w-4 h-4 text-blue-400/50" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                          
                          {typeBusinesses.length === 0 && (
                            <div className="px-3 py-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-slate-500" />
                              </div>
                              <p className="text-xs text-slate-500 font-medium">No businesses yet</p>
                            </div>
                          )}
                        </div>

                        {/* Create New Business Button */}
                        <button
                          onClick={() => handleCreateBusiness(type.key)}
                          className={cn(
                            "relative w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all duration-300",
                            "border-2 border-dashed border-white/20 hover:border-blue-400/50",
                            "text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 group/create",
                            "hover:shadow-lg hover:shadow-blue-500/10"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg border-2 border-dashed border-white/20 group-hover/create:border-blue-400/50 flex items-center justify-center transition-all duration-300">
                            <Plus className="w-4 h-4 group-hover/create:text-blue-400 transition-colors" />
                          </div>
                          <span className="text-sm font-semibold">Create {type.label}</span>
                          <Zap className="w-4 h-4 ml-auto opacity-50 group-hover/create:opacity-100 group-hover/create:text-blue-400 transition-all duration-300" />
                        </button>

                        {/* Features List (on hover/select) */}
                        {isSelected && (
                          <div className="relative mt-6 pt-5 border-t border-white/10">
                            <div className="absolute -top-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Zap className="w-3 h-3" />
                              Key Features
                            </h4>
                            <ul className="space-y-2">
                              {type.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3 text-xs text-slate-300 group">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                  <span className="font-medium group-hover:text-white transition-colors">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Description Section */}
                {selectedType && (
                  <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6">
                    <div className="relative max-w-4xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                          {businessTypes.find(type => type.key === selectedType)?.icon && (
                            React.createElement(businessTypes.find(type => type.key === selectedType)!.icon, { 
                              className: "w-6 h-6 text-white" 
                            })
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-2 tracking-tight">
                            {businessTypes.find(type => type.key === selectedType)?.label}
                          </h3>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {businessTypes.find(type => type.key === selectedType)?.description}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Export business types for use in other components
export { businessTypes }
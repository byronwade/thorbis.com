'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Settings, Upload, Search, Grid3x3, List, Presentation, ArrowLeft, ChevronRight, Filter, ChevronLeft, Package, Wrench, Boxes, TrendingUp, Calendar, X, Hash, FileText, Clock, Star, Download, ChevronDown, BarChart3, LineChart, DollarSign, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryTile } from '@/components/pricebook/category-tile'
import { ServiceGrid } from '@/components/pricebook/service-grid'
import { PresentationMode } from '@/components/pricebook/presentation-mode'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { 
  PricebookCategory, 
  PricebookService, 
  PricebookBreadcrumb, 
  PricebookViewState,
  EstimateLine
} from '@/types/pricebook'
import { pricebookCategories, pricebookServices } from '@/data/pricebook-data'

export default function PricebookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentCategoryPath, setCurrentCategoryPath] = useState<PricebookBreadcrumb[]>([])
  const [currentEstimate, setCurrentEstimate] = useState<EstimateLine[]>([])
  const [services, setServices] = useState(pricebookServices)
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'materials' | 'bundles' | 'maintenance'>('overview')
  const [viewState, setViewState] = useState<PricebookViewState>({
    selectedServiceIds: [],
    searchQuery: ',
    filters: {
      active: true
    },
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'tiles',
    presentationMode: false
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Additional state declarations
  const [searchQuery, setSearchQuery] = useState(')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles')
  const [showAddDropdown, setShowAddDropdown] = useState(false)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddDropdown) {
        setShowAddDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddDropdown])

  // Define helper functions first
  const findCategoryById = (id: string): PricebookCategory | undefined => {
    const searchInCategories = (categories: PricebookCategory[]): PricebookCategory | undefined => {
      for (const category of categories) {
        if (category.id === id) return category
        if (category.children) {
          const found = searchInCategories(category.children)
          if (found) return found
        }
      }
      return undefined
    }
    return searchInCategories(pricebookCategories)
  }

  // Get current categories to display
  const currentCategories = useMemo(() => {
    if (currentCategoryPath.length === 0) {
      // Show top-level categories
      return pricebookCategories.filter(cat => !cat.parentId)
    }
    
    // Find current category and show its children
    const currentCategoryId = currentCategoryPath[currentCategoryPath.length - 1].id
    const currentCategory = findCategoryById(currentCategoryId)
    return currentCategory?.children || []
  }, [currentCategoryPath])

  // Get filtered services (without pagination)
  const filteredServices = useMemo(() => {
    let filtered = services
    
    // Filter by current category
    if (currentCategoryPath.length > 0) {
      const currentCategoryId = currentCategoryPath[currentCategoryPath.length - 1].id
      filtered = filtered.filter(service => 
        service.categoryId === currentCategoryId || 
        service.categoryId.startsWith(currentCategoryId)
      )
    }
    
    // Apply search filter
    if (viewState.searchQuery) {
      const query = viewState.searchQuery.toLowerCase()
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.customerDescription.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Apply filters
    if (viewState.filters.active !== undefined) {
      filtered = filtered.filter(service => service.active === viewState.filters.active)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (viewState.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.pricing.basePrice - b.pricing.basePrice
          break
        case 'popularity':
          comparison = b.timesUsed - a.timesUsed
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      return viewState.sortOrder === 'desc' ? -comparison : comparison
    })
    
    return filtered
  }, [currentCategoryPath, viewState, services])

  // Get current services to display with pagination
  const currentServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredServices.slice(startIndex, endIndex)
  }, [filteredServices, currentPage, itemsPerPage])

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [viewState.searchQuery, currentCategoryPath, viewState.filters])

  const handleCategorySelect = (categoryId: string) => {
    const category = findCategoryById(categoryId)
    if (!category) return
    
    const newPath = [...currentCategoryPath, {
      id: categoryId,
      name: category.name,
      path: `/${categoryId}`
    }]
    setCurrentCategoryPath(newPath)
  }

  const handleNavigateBack = () => {
    setCurrentCategoryPath(prev => prev.slice(0, -1))
  }

  const handleServiceSelect = (serviceId: string) => {
    // Navigate to service view page instead of opening modal
    router.push(`/dashboards/hs/pricebook/service/${serviceId}')
  }

  const handleAddToEstimate = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return
    
    const estimateLine: EstimateLine = {
      id: 'estimate-line-${Date.now()}',
      serviceId: service.id,
      service: service,
      quantity: 1,
      unitPrice: service.pricing.basePrice,
      materialCosts: service.pricing.materialCosts,
      laborCosts: service.pricing.laborRate * service.pricing.estimatedHours,
      subtotal: service.pricing.totalEstimate
    }
    
    setCurrentEstimate(prev => [...prev, estimateLine])
    console.log('Added to estimate:', estimateLine)
  }

  const handleViewModeChange = (mode: 'tiles' | 'list' | 'presentation') => {
    setViewState(prev => ({ ...prev, viewMode: mode }))
  }

  const handleSearchChange = (query: string) => {
    setViewState(prev => ({ ...prev, searchQuery: query }))
  }

  const mockServices = services.slice(0, 3) // Get first 3 services for mock search results

  // TradingView chart data for financial metrics
  const revenueChartData: TradingViewChartData[] = [
    { time: '2024-01-01', value: 45000 },
    { time: '2024-02-01', value: 52000 },
    { time: '2024-03-01', value: 48000 },
    { time: '2024-04-01', value: 61000 },
    { time: '2024-05-01', value: 58000 },
    { time: '2024-06-01', value: 67000 },
    { time: '2024-07-01', value: 72000 },
    { time: '2024-08-01', value: 68000 },
    { time: '2024-09-01', value: 75000 },
    { time: '2024-10-01', value: 82000 },
    { time: '2024-11-01', value: 78000 },
    { time: '2024-12-01', value: 89000 },
  ]

  const pricingChartData: TradingViewChartData[] = [
    { time: '2024-01-01', value: 145.20 },
    { time: '2024-02-01', value: 148.75 },
    { time: '2024-03-01', value: 142.30 },
    { time: '2024-04-01', value: 151.90 },
    { time: '2024-05-01', value: 149.85 },
    { time: '2024-06-01', value: 156.50 },
    { time: '2024-07-01', value: 159.20 },
    { time: '2024-08-01', value: 162.75 },
    { time: '2024-09-01', value: 158.90 },
    { time: '2024-10-01', value: 165.30 },
    { time: '2024-11-01', value: 161.85 },
    { time: '2024-12-01', value: 168.40 },
  ]

  // KPI data for dashboard cards
  const chartData = {
    revenue: [
      { month: 'Jan', value: 45000, change: 12 },
      { month: 'Feb', value: 52000, change: 15.5 },
      { month: 'Mar', value: 48000, change: -7.7 },
      { month: 'Apr', value: 61000, change: 27.1 },
      { month: 'May', value: 58000, change: -4.9 },
      { month: 'Jun', value: 67000, change: 15.5 },
    ],
    topServices: [
      { name: 'Plumbing Repair', value: 85, revenue: 25000, trend: 'up' },
      { name: 'HVAC Service', value: 72, revenue: 18500, trend: 'up' },
      { name: 'Electrical Work', value: 58, revenue: 15800, trend: 'down' },
      { name: 'Water Heater', value: 45, revenue: 12200, trend: 'up' },
    ],
    pricing: {
      current: 156.50,
      change: 12.5,
      trend: 'up',
      volume: 1847
    }
  }

  const handlePresentationToggle = () => {
    setViewState(prev => ({ ...prev, presentationMode: !prev.presentationMode }))
  }

  const handleUpdateEstimate = (newEstimate: EstimateLine[]) => {
    setCurrentEstimate(newEstimate)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const companyInfo = {
    name: 'Thorbis Home Services',
    phone: '(555) 123-4567',
    email: 'info@thorbis.com',
    website: 'thorbis.com',
    logo: '/ThorbisLogo.webp'
  }


  const showCategories = currentCategories.length > 0
  const showServices = currentServices.length > 0 || viewState.searchQuery

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading price book...</p>
        </div>
      </div>
    )
  }

  // Show presentation mode if enabled
  if (viewState.presentationMode) {
    return (
      <PresentationMode
        categories={pricebookCategories}
        services={pricebookServices}
        currentEstimate={currentEstimate}
        onUpdateEstimate={handleUpdateEstimate}
        onExitPresentation={() => setViewState(prev => ({ ...prev, presentationMode: false }))}
        companyInfo={companyInfo}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Integrated Single-Row Toolbar */}
      <div className="sticky top-0 z-20 bg-neutral-900/90 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title and Tabs */}
            <div className="flex items-center gap-4">
              <h1 className="text-base font-medium text-white">Price Book</h1>
              <div className="flex items-center bg-neutral-950/50 border border-neutral-700/50 rounded-lg p-1">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('overview')}
                  className={'h-6 px-2 text-xs font-medium rounded ${
                    activeTab === 'overview'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }'}
                >
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'services' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('services')}
                  className={'h-6 px-2 text-xs font-medium rounded ${
                    activeTab === 'services'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }'}
                >
                  Services
                </Button>
                <Button
                  variant={activeTab === 'materials' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('materials')}
                  className={'h-6 px-2 text-xs font-medium rounded ${
                    activeTab === 'materials'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }'}
                >
                  Materials
                </Button>
                <Button
                  variant={activeTab === 'bundles' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('bundles')}
                  className={'h-6 px-2 text-xs font-medium rounded ${
                    activeTab === 'bundles'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }'}
                >
                  Bundles
                </Button>
                <Button
                  variant={activeTab === 'maintenance' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('maintenance')}
                  className={'h-6 px-2 text-xs font-medium rounded ${
                    activeTab === 'maintenance'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50`
                  }'}
                >
                  Maintenance
                </Button>
              </div>
            </div>

            {/* Right: Search, View Controls, and Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder={'Search ${activeTab}...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearchChange(e.target.value)
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === '/') {
                      e.preventDefault()
                      e.currentTarget.focus()
                    }
                    if (e.key === 'Escape') {
                      setSearchQuery(')
                      handleSearchChange(')
                    }
                  }}
                  className="h-8 pl-10 pr-8 bg-neutral-950/50 border-neutral-700/50 text-sm text-white placeholder:text-neutral-500 focus:border-blue-500/50 transition-all rounded-lg"
                />
                
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(')
                      handleSearchChange(')
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                {/* Compact Search Results */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-lg shadow-xl z-[100] max-h-64 overflow-hidden">
                    <div className="p-3">
                      <div className="space-y-1">
                        {mockServices.filter(service => 
                          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase())
                        ).slice(0, 3).map(service => (
                          <button 
                            key={service.id}
                            className="w-full p-2 rounded hover:bg-neutral-800/50 text-left transition-all"
                            onClick={() => {
                              setSearchQuery(')
                              handleSearchChange(')
                              handleServiceSelect(service.id)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <Wrench className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-white truncate">{service.name}</div>
                                <div className="text-xs text-neutral-500">${service.pricing.basePrice}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* View Controls and Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-950/50 border border-neutral-700/50 rounded-lg p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('tiles')}
                    className={'h-6 w-6 p-0 rounded ${
                      viewMode === 'tiles' 
                        ? 'bg-white text-black' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }'}
                  >
                    <Grid3x3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={'h-6 w-6 p-0 rounded ${
                      viewMode === 'list' 
                        ? 'bg-white text-black' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }'}
                  >
                    <List className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-lg"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button 
                    size="sm"
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add
                    <ChevronDown className="h-3 w-3 ml-1.5" />
                  </Button>

                  {/* Add Dropdown */}
                  {showAddDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-lg shadow-xl z-[100] min-w-48">
                      <div className="p-2">
                        <button 
                          className="w-full p-2 rounded hover:bg-neutral-800/50 text-left transition-all group"
                          onClick={() => {
                            setShowAddDropdown(false)
                            router.push('/dashboards/hs/pricebook/service/new')
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <Wrench className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">Add Service</div>
                              <div className="text-xs text-neutral-500">Create a new service offering</div>
                            </div>
                          </div>
                        </button>
                        <button 
                          className="w-full p-2 rounded hover:bg-neutral-800/50 text-left transition-all group"
                          onClick={() => {
                            setShowAddDropdown(false)
                            // Handle material creation
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                              <Package className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">Add Material</div>
                              <div className="text-xs text-neutral-500">Add materials to inventory</div>
                            </div>
                          </div>
                        </button>
                        <button 
                          className="w-full p-2 rounded hover:bg-neutral-800/50 text-left transition-all group"
                          onClick={() => {
                            setShowAddDropdown(false)
                            // Handle bundle creation
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                              <Boxes className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">Add Bundle</div>
                              <div className="text-xs text-neutral-500">Create service package</div>
                            </div>
                          </div>
                        </button>
                        <button 
                          className="w-full p-2 rounded hover:bg-neutral-800/50 text-left transition-all group"
                          onClick={() => {
                            setShowAddDropdown(false)
                            // Handle maintenance plan creation
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                              <Calendar className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">Add Maintenance Plan</div>
                              <div className="text-xs text-neutral-500">Create recurring service plan</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estimate Summary */}
        {currentEstimate.length > 0 && (
          <div className="px-6 py-2 bg-neutral-950/50 border-t border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium text-white">
                  {currentEstimate.length} item{currentEstimate.length !== 1 ? 's' : '} in estimate
                </span>
              </div>
              <span className="text-sm font-semibold text-white">
                ${currentEstimate.reduce((sum, line) => sum + line.subtotal, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-neutral-950">
        {activeTab === 'overview' && (
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Trading-Style KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Price Ticker */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-neutral-400 font-medium">AVG PRICE</span>
                    </div>
                    <span className={'text-xs px-2 py-1 rounded ${chartData.pricing.trend === 'up' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}'}>
                      {chartData.pricing.trend === 'up' ? '+' : '-'}{chartData.pricing.change}%
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">${chartData.pricing.current}</span>
                    <span className="text-sm text-neutral-500 mb-1">USD</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="h-3 w-3 text-neutral-500" />
                    <span className="text-xs text-neutral-500">{chartData.pricing.volume} services</span>
                  </div>
                </div>

                {/* Revenue Growth */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-neutral-400 font-medium">REVENUE</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400">+15.5%</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">$67.0K</div>
                  <div className="flex items-center h-8">
                    {chartData.revenue.map((item, index) => (
                      <div
                        key={index}
                        className="flex-1 mx-px"
                        style={{
                          height: '${(item.value / 70000) * 100}%',
                          backgroundColor: item.change > 0 ? '#22c55e' : '#ef4444',
                          opacity: 0.7
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Monthly trend</div>
                </div>

                {/* Total Services */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-neutral-400 font-medium">SERVICES</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400">+12</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{services.length}</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-neutral-800 rounded-full h-1">
                      <div className="bg-purple-500 h-1 rounded-full" style={{ width: '68%' }} />
                    </div>
                    <span className="text-xs text-neutral-500">68% active</span>
                  </div>
                </div>

                {/* Materials Volume */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-400" />
                      <span className="text-xs text-neutral-400 font-medium">MATERIALS</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-orange-600/20 text-orange-400">+8.2%</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {services.reduce((acc, service) => acc + service.materials.length, 0)}
                  </div>
                  <div className="text-xs text-neutral-500">SKUs in catalog</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - TradingView */}
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenue Performance</h3>
                      <p className="text-sm text-neutral-400">12-month trend analysis with TradingView</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-neutral-400">12M</span>
                    </div>
                  </div>
                  
                  {/* TradingView Chart */}
                  <div className="h-64">
                    <TradingViewWrapper
                      data={revenueChartData}
                      type="area"
                      height={256}
                      theme="dark"
                      className="rounded-lg overflow-hidden"
                      options={{
                        layout: {
                          background: {
                            type: 1,
                            color: '#171717',
                          },
                        },
                        grid: {
                          vertLines: {
                            color: 'rgba(75, 85, 99, 0.1)',
                          },
                          horzLines: {
                            color: 'rgba(75, 85, 99, 0.1)',
                          },
                        },
                        rightPriceScale: {
                          scaleMargins: {
                            top: 0.1,
                            bottom: 0.1,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Top Services Leaderboard */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Top Services</h3>
                      <p className="text-sm text-neutral-400">Performance leaders</p>
                    </div>
                    <BarChart3 className="h-4 w-4 text-green-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {chartData.topServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-sm font-bold text-neutral-400 w-6">#{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{service.name}</span>
                            <span className={'text-xs ${service.trend === 'up' ? 'text-green-400' : 'text-red-400'}'}>
                              {service.trend === 'up' ? '↗' : '↘'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                              <div 
                                className={'h-1.5 rounded-full ${service.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}'}
                                style={{ width: '${service.value}%' }}
                              />
                            </div>
                            <span className="text-xs text-neutral-400">${(service.revenue / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('services')}
                    className="w-full mt-4 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10"
                  >
                    View All Services
                  </Button>
                </div>
              </div>

              {/* Additional TradingView Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pricing Analysis Chart */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Average Pricing Trends</h3>
                      <p className="text-sm text-neutral-400">Service pricing evolution</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-neutral-400">Live</span>
                    </div>
                  </div>
                  
                  <div className="h-48">
                    <TradingViewWrapper
                      data={pricingChartData}
                      type="line"
                      height={192}
                      theme="dark"
                      className="rounded-lg overflow-hidden"
                      options={{
                        layout: {
                          background: {
                            type: 1,
                            color: '#171717',
                          },
                        },
                        grid: {
                          vertLines: {
                            color: 'rgba(75, 85, 99, 0.08)',
                          },
                          horzLines: {
                            color: 'rgba(75, 85, 99, 0.08)',
                          },
                        },
                        rightPriceScale: {
                          scaleMargins: {
                            top: 0.15,
                            bottom: 0.15,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Volume Analysis Chart */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Service Volume</h3>
                      <p className="text-sm text-neutral-400">Monthly service requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-400" />
                      <span className="text-xs text-neutral-400">Vol</span>
                    </div>
                  </div>
                  
                  <div className="h-48">
                    <TradingViewWrapper
                      data={revenueChartData.map(item => ({
                        time: item.time,
                        value: Math.floor((item.value || 0) / 1000) // Convert to service volume
                      }))}
                      type="histogram"
                      height={192}
                      theme="dark"
                      className="rounded-lg overflow-hidden"
                      options={{
                        layout: {
                          background: {
                            type: 1,
                            color: '#171717',
                          },
                        },
                        grid: {
                          vertLines: {
                            color: 'rgba(75, 85, 99, 0.08)',
                          },
                          horzLines: {
                            color: 'rgba(75, 85, 99, 0.08)',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => router.push('/dashboards/hs/pricebook/service/new')}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                  <Button
                    onClick={() => setActiveTab('materials')}
                    variant="outline"
                    className="h-12 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Materials
                  </Button>
                  <Button
                    onClick={() => setActiveTab('bundles')}
                    variant="outline"
                    className="h-12 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white justify-start"
                  >
                    <Boxes className="h-4 w-4 mr-2" />
                    Create Bundle
                  </Button>
                  <Button
                    onClick={() => setActiveTab('maintenance')}
                    variant="outline"
                    className="h-12 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    New Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Category Grid */}
              {showCategories && (
                <div className="space-y-6">
                  {currentCategoryPath.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium text-white mb-4">Categories</h2>
                    </div>
                  )}
                  <div className={'grid gap-6 ${
                    viewState.presentationMode 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
                  }`}>
                    {currentCategories.map((category) => (
                      <CategoryTile
                        key={category.id}
                        category={category}
                        onSelect={handleCategorySelect}
                        presentationMode={viewState.presentationMode}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Service Grid */}
              {showServices && (
                <div className="space-y-6">
                  {currentServices.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium text-white mb-4">
                        Services {currentCategoryPath.length > 0 && `in ${currentCategoryPath[currentCategoryPath.length - 1].name}'}
                      </h2>
                    </div>
                  )}
                  <ServiceGrid
                    services={currentServices}
                    viewState={viewState}
                    onServiceSelect={handleServiceSelect}
                    onAddToEstimate={handleAddToEstimate}
                    presentationMode={viewState.presentationMode}
                  />
                  
                  {/* Pagination */}
                  {filteredServices.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-800">
                      {/* Left: Items per page selector */}
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span>Show</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white text-sm focus:border-neutral-600 focus:outline-none"
                        >
                          <option value={6}>6</option>
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                          <option value={48}>48</option>
                        </select>
                        <span>per page</span>
                      </div>

                      {/* Center: Page navigation */}
                      <div className="flex items-center gap-1">
                        {/* Previous button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPrevPage}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }

                          if (pageNum === currentPage) {
                            return (
                              <Button
                                key={pageNum}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white text-black hover:bg-neutral-100"
                              >
                                {pageNum}
                              </Button>
                            );
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-900"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        {/* Next button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNextPage}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Right: Page info */}
                      <div className="text-sm text-neutral-400">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Empty state */}
              {!showCategories && !showServices && (
                <div className="text-center py-16">
                  <div className="text-neutral-400 text-lg mb-2">No content found</div>
                  <p className="text-neutral-400 mb-6">
                    {viewState.searchQuery 
                      ? 'No services match "${viewState.searchQuery}"'
                      : 'This category is empty'
                    }
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <Button 
                      variant="outline" 
                      className="h-8 px-4 bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white text-sm font-medium" 
                      onClick={handleNavigateBack}
                    >
                      Go Back
                    </Button>
                    {!viewState.presentationMode && (
                      <Button 
                        className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                        onClick={() => router.push('/dashboards/hs/pricebook/service/new')}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Add Service
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Materials Management</h3>
                <p className="text-neutral-400 mb-6">Manage materials, suppliers, and inventory for your services</p>
                <div className="flex items-center justify-center gap-3">
                  <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                  <Button variant="outline" className="h-10 px-6 bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                    Import Catalog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bundles' && (
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Boxes className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Service Bundles</h3>
                <p className="text-neutral-400 mb-6">Create service packages that combine multiple services and materials</p>
                <div className="flex items-center justify-center gap-3">
                  <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bundle
                  </Button>
                  <Button variant="outline" className="h-10 px-6 bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                    Templates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Maintenance Plans</h3>
                <p className="text-neutral-400 mb-6">Create recurring maintenance schedules and preventive service plans</p>
                <div className="flex items-center justify-center gap-3">
                  <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                  <Button variant="outline" className="h-10 px-6 bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                    Plan Templates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
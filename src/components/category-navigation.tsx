'use client'

import { useState } from 'react'
import { 
  ChevronRight, 
  ArrowLeft,
  Search,
  Grid3x3,
  List,
  Presentation,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PricebookCategory, PricebookBreadcrumb, PricebookViewState } from '@/types/pricebook'

interface CategoryNavigationProps {
  categories: PricebookCategory[]
  currentPath: PricebookBreadcrumb[]
  viewState: PricebookViewState
  onCategorySelect: (categoryId: string) => void
  onNavigateBack: () => void
  onViewModeChange: (mode: 'tiles' | 'list' | 'presentation') => void
  onSearchChange: (query: string) => void
  onPresentationToggle: () => void
}

export function CategoryNavigation({
  categories,
  currentPath,
  viewState,
  onCategorySelect,
  onNavigateBack,
  onViewModeChange,
  onSearchChange,
  onPresentationToggle
}: CategoryNavigationProps) {
  const [searchQuery, setSearchQuery] = useState(viewState.searchQuery)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange(value)
  }

  const getBreadcrumbPath = () => {
    if (currentPath.length === 0) return 'All Categories'
    return currentPath.map(item => item.name).join(' › ')
  }

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="text-sm text-neutral-400">
            {getBreadcrumbPath()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>

          {/* View mode controls */}
          <div className="hidden sm:flex items-center border border-neutral-800 bg-neutral-900 rounded-lg p-1">
            <Button
              variant={viewState.viewMode === 'tiles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('tiles')}
              className={'h-8 px-3 ${viewState.viewMode === 'tiles' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}'}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewState.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={'h-8 px-3 ${viewState.viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}'}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewState.viewMode === 'presentation' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('presentation')}
              className={'h-8 px-3 ${viewState.viewMode === 'presentation' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}'}
            >
              <Presentation className="h-4 w-4" />
            </Button>
          </div>

          {/* Presentation mode toggle */}
          <Button
            variant={viewState.presentationMode ? 'default' : 'outline'}
            onClick={onPresentationToggle}
            className={'flex items-center space-x-2 w-full sm:w-auto justify-center ${
              viewState.presentationMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }'}
          >
            <Presentation className="h-4 w-4" />
            <span className="hidden sm:inline">Customer View</span>
            <span className="sm:hidden">Present</span>
          </Button>
        </div>
      </div>

      {/* Category tiles grid */}
      <div className={'grid gap-6 ${
        viewState.presentationMode 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }'}>
        {categories.map((category) => (
          <CategoryTile
            key={category.id}
            category={category}
            onSelect={onCategorySelect}
            presentationMode={viewState.presentationMode}
          />
        ))}
      </div>
    </div>
  )
}

interface CategoryTileProps {
  category: PricebookCategory
  onSelect: (categoryId: string) => void
  presentationMode: boolean
}

function CategoryTile({ category, onSelect, presentationMode }: CategoryTileProps) {
  return (
    <div
      onClick={() => onSelect(category.id)}
      className="
        bg-neutral-950 border border-neutral-800 rounded-lg p-6
        cursor-pointer transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900
        flex flex-col group min-h-[11rem]
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-200">
          <Settings className="w-5 h-5 text-neutral-400" />
        </div>
        
        {category.children && category.children.length > 0 && (
          <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 transition-colors duration-200" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-medium text-white mb-3 leading-snug">
          {category.name}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2 mb-4">
          {category.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{category.serviceCount}</span>
          <span className="text-xs text-neutral-500">services</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-white">${category.avgPrice}</span>
          <span className="text-xs text-neutral-500">avg price</span>
        </div>
      </div>
    </div>
  )
}
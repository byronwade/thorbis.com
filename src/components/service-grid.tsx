'use client'

import { useState } from 'react'
import { 
  DollarSign, 
  Clock, 
  Star, 
  Tag, 
  Eye,
  Plus,
  Image as ImageIcon,
  FileText,
  Video,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PricebookService, PricebookViewState } from '@/types/pricebook'

interface ServiceGridProps {
  services: PricebookService[]
  viewState: PricebookViewState
  onServiceSelect: (serviceId: string) => void
  onAddToEstimate: (serviceId: string) => void
  presentationMode?: boolean
}

export function ServiceGrid({ 
  services, 
  viewState, 
  onServiceSelect, 
  onAddToEstimate,
  presentationMode = false
}: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-neutral-400 text-lg mb-2">No services found</div>
        <p className="text-neutral-400 mb-6">
          {viewState.searchQuery 
            ? 'No services match "${viewState.searchQuery}"'
            : 'This category doesn\'t have any services yet'
          }
        </p>
        {!presentationMode && (
          <Button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add Service
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={'grid gap-6 ${
      presentationMode 
        ? 'grid-cols-1 lg:grid-cols-2' 
        : viewState.viewMode === 'tiles' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
    }'}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onServiceSelect={onServiceSelect}
          onAddToEstimate={onAddToEstimate}
          presentationMode={presentationMode}
          viewMode={viewState.viewMode}
        />
      ))}
    </div>
  )
}

interface ServiceCardProps {
  service: PricebookService
  onServiceSelect: (serviceId: string) => void
  onAddToEstimate: (serviceId: string) => void
  presentationMode: boolean
  viewMode: 'tiles' | 'list' | 'presentation`
}

function ServiceCard({ 
  service, 
  onServiceSelect, 
  onAddToEstimate, 
  presentationMode,
  viewMode 
}: ServiceCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return '${hours}h ${mins > 0 ? '${mins}m' : '}'
    }
    return '${mins}m'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-600/10 text-green-400 border border-green-600/20'
      case 'intermediate': return 'bg-yellow-600/10 text-yellow-400 border border-yellow-600/20'
      case 'advanced': return 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
      case 'expert': return 'bg-red-600/10 text-red-400 border border-red-600/20'
      default: return 'bg-neutral-800 text-neutral-300 border border-neutral-700'
    }
  }

  // Generate background images for certain services with better variety
  const getBackgroundImage = (serviceId: string, serviceName: string) => {
    const imageServices = ['plumbing-basic-inspection', 'electrical-outlet-install', 'plumbing-water-heater-install']
    if (!imageServices.includes(serviceId)) return null
    
    const images = {
      'plumbing-basic-inspection': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&h=600&fit=crop&crop=center',
      'electrical-outlet-install': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1000&h=600&fit=crop&crop=center',
      'plumbing-water-heater-install': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1000&h=600&fit=crop&crop=center'
    }
    
    return images[serviceId as keyof typeof images] || null
  }

  const backgroundImage = getBackgroundImage(service.id, service.name)
  
  if (viewMode === 'list') {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-all duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-white truncate">{service.name}</h3>
              {service.featured && (
                <span className="px-2 py-1 rounded bg-orange-600 text-white text-xs font-medium">Featured</span>
              )}
            </div>
            <p className="text-sm text-neutral-400 line-clamp-2">{service.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(service.duration.average)}
              </span>
              {service.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  {service.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-white">${service.pricing.basePrice.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 mb-2">
              ${service.pricing.laborRate}/hr × {service.pricing.estimatedHours}h
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onServiceSelect(service.id)
                }}
                className="h-7 w-7 p-0 bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToEstimate(service.id)
                }}
                className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="
        bg-neutral-950 border border-neutral-800 rounded-lg p-6
        cursor-pointer transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900
        flex flex-col group min-h-[18rem]
      "
      onClick={() => onServiceSelect(service.id)}
    >
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            {service.featured && (
              <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium">
                Featured
              </span>
            )}
            <span className={'px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(service.difficulty)}'}>
              {service.difficulty}
            </span>
          </div>
          {service.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="text-sm text-neutral-300">{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-medium text-white mb-4 leading-snug">
          {service.name}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
          {presentationMode ? service.customerDescription : service.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="mb-5">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(service.duration.average)}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {service.timesUsed} uses
          </span>
          {service.warranty.duration > 0 && (
            <span className="flex items-center gap-1 text-green-400">
              <Shield className="h-3 w-3" />
              {service.warranty.duration}d warranty
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-neutral-800">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-white">
              ${service.pricing.basePrice.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              ${service.pricing.laborRate}/hr × {service.pricing.estimatedHours}h
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onServiceSelect(service.id)
              }}
              className="h-7 w-7 p-0 bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <Eye className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddToEstimate(service.id)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-xs font-medium"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
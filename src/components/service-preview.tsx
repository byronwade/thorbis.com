'use client'

import { Clock, Star, Tag, Shield, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PricebookService } from '@/types/pricebook'

interface ServicePreviewProps {
  service: Partial<PricebookService>
}

export function ServicePreview({ service }: ServicePreviewProps) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
        <h3 className="text-base font-medium text-white mb-3">Live Preview</h3>
        
        {/* Service Card Preview */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 min-h-[18rem] flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {service.featured && (
                  <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium">
                    Featured
                  </span>
                )}
                <span className={'px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(service.difficulty || 'basic')}'}>
                  {service.difficulty || 'basic'}
                </span>
              </div>
              {service.rating && service.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm text-neutral-300">{service.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className="text-base font-medium text-white mb-3 leading-snug">
              {service.name || 'Service Name'}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-4">
              {service.customerDescription || service.description || 'Service description will appear here...'}
            </p>
          </div>

          {/* Metadata */}
          <div className="mb-4">
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration ? formatDuration(service.duration.average) : '1h 30m'}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {service.timesUsed || 0} uses
              </span>
              {service.warranty && service.warranty.duration > 0 && (
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
                  {formatCurrency(service.pricing?.totalEstimate || service.pricing?.basePrice || 0)}
                </div>
                <div className="text-xs text-neutral-500">
                  ${service.pricing?.laborRate || 85}/hr × {service.pricing?.estimatedHours || 1}h
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  View
                </Button>
                
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs font-medium"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Service Details</h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Service Type:</span>
            <span className="text-white capitalize">{service.serviceType || 'installation'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Difficulty:</span>
            <span className="text-white capitalize">{service.difficulty || 'basic'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Duration:</span>
            <span className="text-white">
              {service.duration ? '${service.duration.min}-${service.duration.max} min' : '60-120 min'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Status:</span>
            <span className={'${service.active !== false ? 'text-green-400' : 'text-red-400'}'}>
              {service.active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {service.warranty && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Warranty:</span>
              <span className="text-white">
                {service.warranty.duration} days ({service.warranty.type})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Pricing Breakdown</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Base Price:</span>
            <span className="text-white">{formatCurrency(service.pricing?.basePrice || 0)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Labor:</span>
            <span className="text-white">
              {formatCurrency((service.pricing?.laborRate || 85) * (service.pricing?.estimatedHours || 1))}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Materials:</span>
            <span className="text-white">{formatCurrency(service.pricing?.materialCosts || 0)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-neutral-400">Markup ({service.pricing?.markup || 15}%):</span>
            <span className="text-white">
              {formatCurrency(((service.pricing?.totalEstimate || 0) - 
                ((service.pricing?.basePrice || 0) + 
                 (service.pricing?.materialCosts || 0) + 
                 ((service.pricing?.laborRate || 85) * (service.pricing?.estimatedHours || 1)))))}
            </span>
          </div>
          
          <div className="flex justify-between pt-2 border-t border-neutral-800 font-semibold">
            <span className="text-white">Total:</span>
            <span className="text-white">{formatCurrency(service.pricing?.totalEstimate || 0)}</span>
          </div>
        </div>
      </div>

      {/* Materials */}
      {service.materials && service.materials.length > 0 && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Materials ({service.materials.length})</h4>
          
          <div className="space-y-2">
            {service.materials.slice(0, 3).map((material, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-neutral-400 truncate">{material.name}</span>
                <span className="text-white flex-shrink-0">
                  {material.quantity}x ${material.unitPrice}
                </span>
              </div>
            ))}
            {service.materials.length > 3 && (
              <div className="text-xs text-neutral-500">
                +{service.materials.length - 3} more materials
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {(service.primaryImage || (service.galleryImages && service.galleryImages.length > 0)) && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Images</h4>
          
          <div className="space-y-2">
            {service.primaryImage && (
              <div>
                <img
                  src={service.primaryImage}
                  alt="Primary"
                  className="w-full h-24 object-cover rounded"
                />
                <div className="text-xs text-neutral-500 mt-1">Primary Image</div>
              </div>
            )}
            
            {service.galleryImages && service.galleryImages.length > 0 && (
              <div>
                <div className="grid grid-cols-3 gap-1">
                  {service.galleryImages.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={'Gallery ${index + 1}'}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
                {service.galleryImages.length > 3 && (
                  <div className="text-xs text-neutral-500 mt-1">
                    +{service.galleryImages.length - 3} more images
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Star, Clock, Tag, Shield, DollarSign, Package, Building2, ExternalLink, Calendar, User, Award, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { pricebookServices } from '@/data/pricebook-data'
import { PricebookService } from '@/types/pricebook'

export default function ServiceViewPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  
  const [service, setService] = useState<PricebookService | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load service data
    const foundService = pricebookServices.find(s => s.id === serviceId)
    if (foundService) {
      setService(foundService)
    }
    setLoading(false)
  }, [serviceId])

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

  const handleEditService = () => {
    router.push('/dashboards/hs/pricebook/service/${serviceId}/edit')
  }

  const handleBackToPricebook = () => {
    router.push('/dashboards/hs/pricebook')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Service Not Found</h2>
          <p className="text-neutral-400 mb-6">The service you're looking for doesn`t exist.</p>
          <Button 
            variant="outline" 
            onClick={handleBackToPricebook}
            className="h-8 px-4 bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white text-sm font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Back to Price Book
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header */}
      <div className="bg-black border-b border-neutral-800">
        {/* Top Bar - Navigation and Title */}
        <div className="px-6 py-3 border-b border-neutral-800/50">
          <div className="flex items-center justify-between">
            {/* Left: Navigation and Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToPricebook}
                className="h-7 px-2 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Price Book</span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                <h1 className="text-lg font-medium text-white tracking-tight">
                  {service.name}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0 text-xs"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Duplicate
              </Button>
              <div className="w-px h-4 bg-neutral-700 mx-1" />
              <Button 
                onClick={handleEditService} 
                size="sm"
                className="h-7 px-3 bg-white text-black hover:bg-neutral-100 font-medium text-xs"
              >
                <Edit className="h-3 w-3 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Service Info Bar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Service Details */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {service.featured && (
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs">
                    Featured
                  </Badge>
                )}
                <Badge className={'${getDifficultyColor(service.difficulty)} text-xs'}>
                  {service.difficulty}
                </Badge>
                <Badge className={'${
                  service.active 
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                    : 'bg-red-600/20 text-red-400 border border-red-600/30'
                } text-xs'}>
                  {service.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="h-4 w-px bg-neutral-700" />
              
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(service.duration.average)}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {service.timesUsed} uses
                </span>
                {service.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    {service.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-neutral-400">Service Type</div>
                <div className="text-xs text-neutral-500 capitalize">{service.serviceType}</div>
              </div>
              <div className="h-8 w-px bg-neutral-700" />
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(service.pricing.totalEstimate)}
                </div>
                <div className="text-xs text-neutral-500">
                  Base: {formatCurrency(service.pricing.basePrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-neutral-950">
        <div className="p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Images */}
            {(service.primaryImage || service.galleryImages?.length > 0) && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">Service Images</h2>
                <div className="space-y-4">
                  {service.primaryImage && (
                    <div>
                      <img
                        src={service.primaryImage}
                        alt={service.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <p className="text-xs text-neutral-500 mt-2">Primary Image</p>
                    </div>
                  )}
                  {service.galleryImages && service.galleryImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {service.galleryImages.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={'${service.name} ${index + 1}'}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Service Description</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">Customer Description</h3>
                  <p className="text-neutral-400 leading-relaxed">{service.customerDescription}</p>
                </div>
                <Separator className="bg-neutral-800" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">Internal Description</h3>
                  <p className="text-neutral-400 leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>

            {/* Materials */}
            {service.materials && service.materials.length > 0 && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materials & Supplies ({service.materials.length})
                </h2>
                <div className="space-y-3">
                  {service.materials.map((material, index) => {
                    const totalCost = material.unitPrice * material.quantity * (1 + material.markup / 100)
                    return (
                      <div key={index} className="bg-neutral-900 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-white">{material.name}</h4>
                              {material.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 mb-2">{material.description}</p>
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              <span>#{material.partNumber}</span>
                              <span>{material.quantity} {material.unit}</span>
                              <span>${material.unitPrice} each</span>
                              <span>{material.markup}% markup</span>
                              {material.supplier && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  <span>{material.supplier}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-white">{formatCurrency(totalCost)}</div>
                            <div className="text-xs text-neutral-500">total cost</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Total Material Cost</span>
                      <span className="text-white">{formatCurrency(service.pricing.materialCosts)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.requirements && service.requirements.length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                  <h3 className="text-base font-medium text-white mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.tools && service.tools.length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                  <h3 className="text-base font-medium text-white mb-4">Required Tools</h3>
                  <ul className="space-y-2">
                    {service.tools.map((tool, index) => (
                      <li key={index} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.certifications && service.certifications.length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 md:col-span-2">
                  <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Required Certifications
                  </h3>
                  <ul className="space-y-2">
                    {service.certifications.map((cert, index) => (
                      <li key={index} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Service Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(service.pricing.totalEstimate)}</div>
                    <div className="text-xs text-neutral-500">Total estimate</div>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-400">Duration</span>
                    </div>
                    <span className="text-sm text-white">{formatDuration(service.duration.average)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-400">Times Used</span>
                    </div>
                    <span className="text-sm text-white">{service.timesUsed}</span>
                  </div>

                  {service.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-neutral-400">Rating</span>
                      </div>
                      <span className="text-sm text-white">{service.rating.toFixed(1)}/5</span>
                    </div>
                  )}

                  {service.warranty.duration > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-neutral-400">Warranty</span>
                      </div>
                      <span className="text-sm text-white">{service.warranty.duration} days</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Pricing Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Base Price</span>
                  <span className="text-white">{formatCurrency(service.pricing.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Labor ({service.pricing.estimatedHours}h @ ${service.pricing.laborRate}/hr)</span>
                  <span className="text-white">{formatCurrency(service.pricing.laborRate * service.pricing.estimatedHours)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Materials</span>
                  <span className="text-white">{formatCurrency(service.pricing.materialCosts)}</span>
                </div>
                <Separator className="bg-neutral-800" />
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Markup ({service.pricing.markup}%)</span>
                  <span className="text-white">{formatCurrency(service.pricing.totalEstimate - (service.pricing.basePrice + service.pricing.materialCosts + (service.pricing.laborRate * service.pricing.estimatedHours)))}</span>
                </div>
                <Separator className="bg-neutral-800" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatCurrency(service.pricing.totalEstimate)}</span>
                </div>
                <div className="text-xs text-neutral-500 text-center">
                  {service.pricing.profitMargin.toFixed(1)}% profit margin
                </div>
              </div>
            </div>

            {/* Service Metadata */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Service Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Created</span>
                  <span className="text-white">{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Last Updated</span>
                  <span className="text-white">{new Date(service.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Created By</span>
                  <span className="text-white">{service.createdBy}</span>
                </div>
                {service.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Approved By</span>
                    <span className="text-white">{service.approvedBy}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">Version</span>
                  <span className="text-white">v{service.version}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
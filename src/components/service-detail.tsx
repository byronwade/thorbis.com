'use client'

import { useState } from 'react'
import { 
  X, 
  DollarSign, 
  Clock, 
  Star, 
  Shield, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Wrench, 
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  Calculator
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PricebookService, ServiceMaterial, EstimateLine } from '@/types/pricebook'

interface ServiceDetailProps {
  service: PricebookService
  onClose: () => void
  onAddToEstimate: (estimateLine: EstimateLine) => void
  presentationMode?: boolean
}

export function ServiceDetail({ 
  service, 
  onClose, 
  onAddToEstimate, 
  presentationMode = false 
}: ServiceDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(service.requiredMaterials)
  const [customNotes, setCustomNotes] = useState(')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200`
    }
  }

  const calculateTotal = () => {
    const basePrice = service.pricing.basePrice * quantity
    const laborCost = service.pricing.laborRate * service.pricing.estimatedHours * quantity
    
    const materialCost = service.materials
      .filter(material => selectedMaterials.includes(material.id))
      .reduce((sum, material) => {
        const cost = material.unitPrice * material.quantity * quantity
        const markup = cost * (material.markup / 100)
        return sum + cost + markup
      }, 0)
    
    return {
      basePrice,
      laborCost,
      materialCost,
      total: basePrice + materialCost
    }
  }

  const totals = calculateTotal()

  const handleAddToEstimate = () => {
    const estimateLine: EstimateLine = {
      id: `estimate-line-${Date.now()}',
      serviceId: service.id,
      service: service,
      quantity: quantity,
      unitPrice: service.pricing.basePrice,
      materialCosts: totals.materialCost / quantity,
      laborCosts: totals.laborCost / quantity,
      subtotal: totals.total,
      notes: customNotes || undefined,
      customizations: {
        selectedMaterials: selectedMaterials
      }
    }
    
    onAddToEstimate(estimateLine)
    onClose()
  }

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        // Don't remove required materials
        if (service.requiredMaterials.includes(materialId)) return prev
        return prev.filter(id => id !== materialId)
      } else {
        return [...prev, materialId]
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={'
        bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden
        ${presentationMode ? 'max-w-5xl' : '}
      '}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-1">
            <h2 className={'font-bold text-neutral-900 dark:text-white ${
              presentationMode ? 'text-2xl' : 'text-xl'
            }'}>
              {service.name}
            </h2>
            <p className={'text-neutral-600 dark:text-neutral-400 ${
              presentationMode ? 'text-base mt-2' : 'text-sm mt-1`
            }`}>
              {presentationMode ? service.customerDescription : service.description}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Service images and attachments */}
            {(service.galleryImages.length > 0 || service.attachments.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image gallery */}
                {service.galleryImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                    <div className="space-y-3">
                      <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                        <img
                          src={service.galleryImages[activeImageIndex]}
                          alt={'${service.name} ${activeImageIndex + 1}'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {service.galleryImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {service.galleryImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImageIndex(index)}
                              className={'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                index === activeImageIndex 
                                  ? 'border-blue-500' 
                                  : 'border-transparent`
                              }'}
                            >
                              <img
                                src={image}
                                alt={'${service.name} thumbnail ${index + 1}'}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {service.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Resources</h3>
                    <div className="space-y-2">
                      {service.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                        >
                          <div className="mr-3">
                            {attachment.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                            {attachment.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500" />}
                            {attachment.type === 'video` && <Video className="h-5 w-5 text-purple-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{attachment.name}</div>
                            {attachment.description && (
                              <div className="text-xs text-neutral-500">{attachment.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Service info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                  <div className="space-y-3">
                    {/* Service type and difficulty */}
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="capitalize">
                        {service.serviceType}
                      </Badge>
                      <div className={'px-2 py-1 rounded-full text-xs ${getDifficultyColor(service.difficulty)}'}>
                        {service.difficulty}
                      </div>
                      {service.featured && (
                        <Badge className="bg-orange-500 text-white">Featured</Badge>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {formatDuration(service.duration.min)} - {formatDuration(service.duration.max)}
                      <span className="ml-2 text-neutral-500">(avg: {formatDuration(service.duration.average)})</span>
                    </div>

                    {/* Rating */}
                    {service.rating > 0 && (
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <Star className="h-4 w-4 mr-2 fill-current text-yellow-400" />
                        {service.rating.toFixed(1)} rating • Used {service.timesUsed} times
                      </div>
                    )}

                    {/* Warranty */}
                    {service.warranty.duration > 0 && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <Shield className="h-4 w-4 mr-2" />
                        {service.warranty.duration} day {service.warranty.type} warranty
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                {service.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                      {service.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-500 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tools */}
                {service.tools.length > 0 && !presentationMode && (
                  <div>
                    <h4 className="font-medium mb-2">Tools Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs rounded-md"
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Pricing and materials */}
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Base price</span>
                      <span className="font-medium">${service.pricing.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Labor rate</span>
                      <span className="font-medium">${service.pricing.laborRate}/hr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Estimated time</span>
                      <span className="font-medium">{service.pricing.estimatedHours}h</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total estimate</span>
                      <span className="text-blue-600 dark:text-blue-400">${totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Materials */}
                {service.materials.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Materials</h4>
                    <div className="space-y-2">
                      {service.materials.map((material) => {
                        const isSelected = selectedMaterials.includes(material.id)
                        const isRequired = service.requiredMaterials.includes(material.id)
                        
                        return (
                          <div
                            key={material.id}
                            className={'p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                            }'}
                            onClick={() => toggleMaterial(material.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={'w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-neutral-300 dark:border-neutral-600'
                                }'}>
                                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{material.name}</div>
                                  <div className="text-xs text-neutral-500">
                                    {material.description} • ${material.unitPrice}/{material.unit}
                                    {isRequired && <span className="text-orange-500 ml-1">Required</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                ${(material.unitPrice * material.quantity * (1 + material.markup / 100)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity and notes */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Notes</label>
                    <Textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Add any special instructions or customizations..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Total: <span className="text-lg font-bold text-neutral-900 dark:text-white">
                ${totals.total.toLocaleString()}
              </span>
              {quantity > 1 && (
                <span className="ml-2">(${service.pricing.basePrice.toLocaleString()} × {quantity})</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAddToEstimate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calculator className="h-4 w-4 mr-2" />
                Add to Estimate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
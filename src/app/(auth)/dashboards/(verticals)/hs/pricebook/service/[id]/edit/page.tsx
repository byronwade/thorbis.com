'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2, Upload, Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialManager } from '@/components/pricebook/service-edit/material-manager'
import { ImageManager } from '@/components/pricebook/service-edit/image-manager'
import { PricingCalculator } from '@/components/pricebook/service-edit/pricing-calculator'
import { ServicePreview } from '@/components/pricebook/service-edit/service-preview'
import { pricebookServices } from '@/data/pricebook-data'
import { PricebookService, ServiceMaterial } from '@/types/pricebook'

export default function ServiceEditPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  
  const [service, setService] = useState<PricebookService | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPreview, setShowPreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: ',
    description: ',
    customerDescription: ',
    categoryId: ',
    serviceType: 'installation' as const,
    difficulty: 'basic' as const,
    active: true,
    featured: false,
    tags: [] as string[],
    requirements: [] as string[],
    tools: [] as string[],
    certifications: [] as string[],
    duration: {
      min: 60,
      max: 120,
      average: 90
    },
    warranty: {
      duration: 30,
      description: ',
      type: 'labor' as const
    },
    pricing: {
      basePrice: 0,
      laborRate: 85,
      estimatedHours: 1,
      materialCosts: 0,
      totalEstimate: 0,
      markup: 15,
      profitMargin: 35,
      lastUpdated: new Date().toISOString()
    }
  })
  
  const [materials, setMaterials] = useState<ServiceMaterial[]>([])
  const [images, setImages] = useState({
    primaryImage: ',
    galleryImages: [] as string[]
  })

  useEffect(() => {
    // Load service data
    const foundService = pricebookServices.find(s => s.id === serviceId)
    if (foundService) {
      setService(foundService)
      setFormData({
        name: foundService.name,
        description: foundService.description,
        customerDescription: foundService.customerDescription,
        categoryId: foundService.categoryId,
        serviceType: foundService.serviceType,
        difficulty: foundService.difficulty,
        active: foundService.active,
        featured: foundService.featured,
        tags: foundService.tags,
        requirements: foundService.requirements,
        tools: foundService.tools,
        certifications: foundService.certifications,
        duration: foundService.duration,
        warranty: foundService.warranty,
        pricing: foundService.pricing
      })
      setMaterials(foundService.materials || [])
      setImages({
        primaryImage: foundService.primaryImage || ',
        galleryImages: foundService.galleryImages || []
      })
    }
    setLoading(false)
  }, [serviceId])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Calculate total costs
      const materialCosts = materials.reduce((sum, material) => 
        sum + (material.unitPrice * material.quantity * (1 + material.markup / 100)), 0
      )
      
      const laborCosts = formData.pricing.laborRate * formData.pricing.estimatedHours
      const totalEstimate = formData.pricing.basePrice + materialCosts + laborCosts

      const updatedService = {
        ...service,
        ...formData,
        materials,
        primaryImage: images.primaryImage,
        galleryImages: images.galleryImages,
        pricing: {
          ...formData.pricing,
          materialCosts,
          totalEstimate,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }

      // In a real app, this would make an API call
      console.log('Saving service:', updatedService)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update last saved timestamp
      setLastSaved(new Date().toISOString())
      
      router.push('/dashboards/hs/pricebook')
    } catch (error) {
      console.error('Error saving service:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleFormChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedFormChange = (section: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
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
          <p className="text-neutral-400 mb-6">The service you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
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
                onClick={handleCancel}
                className="h-7 px-2 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Price Book</span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                <span className="text-sm text-neutral-500">{service.name}</span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                <h1 className="text-lg font-medium text-white tracking-tight">
                  Edit Service
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-7 px-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0 text-xs"
              >
                <Eye className="h-3 w-3 mr-1.5" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 px-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0 text-xs"
              >
                <X className="h-3 w-3 mr-1.5" />
                Cancel
              </Button>
              <div className="w-px h-4 bg-neutral-700 mx-1" />
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="h-7 px-3 bg-white text-black hover:bg-neutral-100 font-medium text-xs"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black mr-1.5"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1.5" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Status Bar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Auto-save Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={'w-2 h-2 rounded-full ${lastSaved ? 'bg-green-500' : 'bg-yellow-500'}'} />
                <span className="text-xs text-neutral-500">
                  {lastSaved ? 'Saved ${new Date(lastSaved).toLocaleTimeString()}' : 'Unsaved changes'}
                </span>
              </div>
              
              <div className="h-4 w-px bg-neutral-700" />
              
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>Version {service.version}</span>
                <span>Modified by {service.createdBy}</span>
              </div>
            </div>

            {/* Right: Editor Controls */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-neutral-500">
                {showPreview ? 'Preview On' : 'Edit Mode'}
              </div>
              <div className="h-4 w-px bg-neutral-700" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border-0 text-xs"
              >
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden bg-neutral-950">
        {/* Main Form */}
        <div className={'${showPreview ? 'w-2/3' : 'w-full'} p-8 overflow-auto'}>
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-neutral-900 border border-neutral-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="materials" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Materials
                </TabsTrigger>
                <TabsTrigger value="images" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Images
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-white mb-6">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-neutral-300">Service Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                          placeholder="Enter service name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="serviceType" className="text-sm font-medium text-neutral-300">Service Type</Label>
                        <Select value={formData.serviceType} onValueChange={(value) => handleFormChange('serviceType', value)}>
                          <SelectTrigger className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem value="installation">Installation</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="difficulty" className="text-sm font-medium text-neutral-300">Difficulty Level</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => handleFormChange('difficulty', value)}>
                          <SelectTrigger className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="active" className="text-sm font-medium text-neutral-300">Active Service</Label>
                        <Switch
                          id="active"
                          checked={formData.active}
                          onCheckedChange={(checked) => handleFormChange('active', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="featured" className="text-sm font-medium text-neutral-300">Featured Service</Label>
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => handleFormChange('featured', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-neutral-300">Internal Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        className="mt-1 bg-neutral-900 border-neutral-700 text-white text-sm min-h-[100px]"
                        placeholder="Detailed internal description for staff"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerDescription" className="text-sm font-medium text-neutral-300">Customer Description</Label>
                      <Textarea
                        id="customerDescription"
                        value={formData.customerDescription}
                        onChange={(e) => handleFormChange('customerDescription', e.target.value)}
                        className="mt-1 bg-neutral-900 border-neutral-700 text-white text-sm min-h-[100px]"
                        placeholder="Customer-facing description"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <PricingCalculator
                  pricing={formData.pricing}
                  materials={materials}
                  onChange={(pricing) => handleFormChange('pricing', pricing)}
                />
              </TabsContent>

              <TabsContent value="materials">
                <MaterialManager
                  materials={materials}
                  onChange={setMaterials}
                />
              </TabsContent>

              <TabsContent value="images">
                <ImageManager
                  primaryImage={images.primaryImage}
                  galleryImages={images.galleryImages}
                  onChange={setImages}
                />
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  {/* Duration */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Duration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-neutral-300">Minimum (minutes)</Label>
                        <Input
                          type="number"
                          value={formData.duration.min}
                          onChange={(e) => handleNestedFormChange('duration', 'min', parseInt(e.target.value))}
                          className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-neutral-300">Maximum (minutes)</Label>
                        <Input
                          type="number"
                          value={formData.duration.max}
                          onChange={(e) => handleNestedFormChange('duration', 'max', parseInt(e.target.value))}
                          className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-neutral-300">Average (minutes)</Label>
                        <Input
                          type="number"
                          value={formData.duration.average}
                          onChange={(e) => handleNestedFormChange('duration', 'average', parseInt(e.target.value))}
                          className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warranty */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Warranty</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-neutral-300">Duration (days)</Label>
                        <Input
                          type="number"
                          value={formData.warranty.duration}
                          onChange={(e) => handleNestedFormChange('warranty', 'duration', parseInt(e.target.value))}
                          className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-neutral-300">Type</Label>
                        <Select 
                          value={formData.warranty.type} 
                          onValueChange={(value) => handleNestedFormChange('warranty', 'type', value)}
                        >
                          <SelectTrigger className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem value="labor">Labor Only</SelectItem>
                            <SelectItem value="parts">Parts Only</SelectItem>
                            <SelectItem value="full">Full Coverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-neutral-300">Warranty Description</Label>
                      <Textarea
                        value={formData.warranty.description}
                        onChange={(e) => handleNestedFormChange('warranty', 'description', e.target.value)}
                        className="mt-1 h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                        placeholder="Describe what's covered under warranty"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/3 border-l border-neutral-800 p-8 overflow-auto">
            <ServicePreview
              service={{
                ...service,
                ...formData,
                materials,
                primaryImage: images.primaryImage,
                galleryImages: images.galleryImages
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialManager } from '@/components/pricebook/service-edit/material-manager'
import { PricingCalculator } from '@/components/pricebook/service-edit/pricing-calculator'
import { ImageManager } from '@/components/pricebook/service-edit/image-manager'
import { ServicePreview } from '@/components/pricebook/service-edit/service-preview'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PricebookService, ServiceMaterial } from '@/types/pricebook'

export default function NewServicePage() {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: ',
    description: ',
    customerDescription: ',
    serviceType: 'installation' as const,
    difficulty: 'basic' as const,
    active: true,
    featured: false,
    categoryId: ',
    tags: [] as string[],
    duration: {
      min: 60,
      max: 120,
      average: 90
    },
    warranty: {
      duration: 365,
      type: 'parts_and_labor' as const,
      terms: 'Standard warranty covers parts and labor for manufacturing defects'
    },
    requirements: [] as string[],
    tools: [] as string[],
    certifications: [] as string[],
    pricing: {
      basePrice: 0,
      laborRate: 85,
      estimatedHours: 1,
      materialCosts: 0,
      totalEstimate: 0,
      markup: 15,
      profitMargin: 35
    }
  })
  
  const [materials, setMaterials] = useState<ServiceMaterial[]>([])
  const [images, setImages] = useState({
    primaryImage: ',
    galleryImages: [] as string[]
  })

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }))
  }

  const handleArrayInputChange = (field: string, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMaterialsChange = (newMaterials: ServiceMaterial[]) => {
    setMaterials(newMaterials)
    
    // Calculate total material costs
    const totalMaterialCosts = newMaterials.reduce((sum, material) => 
      sum + (material.unitPrice * material.quantity * (1 + material.markup / 100)), 0
    )
    
    handleNestedInputChange('pricing', 'materialCosts', totalMaterialCosts)
  }

  const handlePricingChange = (pricing: typeof formData.pricing) => {
    setFormData(prev => ({
      ...prev,
      pricing
    }))
  }

  const handleImagesChange = (newImages: { primaryImage: string; galleryImages: string[] }) => {
    setImages(newImages)
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Create new service object
      const newService: Partial<PricebookService> = {
        ...formData,
        id: 'service-${Date.now()}',
        materials,
        primaryImage: images.primaryImage,
        galleryImages: images.galleryImages,
        timesUsed: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        version: '1.0'
      }
      
      // In a real app, this would save to the backend
      console.log('Creating new service:', newService)
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate back to price book
      router.push('/dashboards/hs/pricebook')
    } catch (error) {
      console.error('Failed to save service:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboards/hs/pricebook')
  }

  // Combine form data for preview
  const serviceForPreview: Partial<PricebookService> = {
    ...formData,
    materials,
    primaryImage: images.primaryImage,
    galleryImages: images.galleryImages,
    timesUsed: 0,
    rating: 0
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
                <h1 className="text-lg font-medium text-white tracking-tight">
                  Create Service
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
                disabled={saving || !formData.name}
                size="sm"
                className="h-7 px-3 bg-white text-black hover:bg-neutral-100 font-medium text-xs"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black mr-1.5"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1.5" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Creation Status Bar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-neutral-500">New Service</span>
              </div>
              
              <div className="h-4 w-px bg-neutral-700" />
              
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>Form validation: {formData.name ? 'Valid' : 'Required fields missing'}</span>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-neutral-500">
                {showPreview ? 'Preview Mode' : 'Edit Mode'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className={'max-w-7xl mx-auto grid gap-8 ${showPreview ? 'grid-cols-3' : 'grid-cols-1'}'}>
          {/* Main Form */}
          <div className={showPreview ? 'col-span-2' : 'col-span-1'}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="bg-neutral-900 border border-neutral-800 w-full">
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
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-6">
                  <h2 className="text-lg font-medium text-white">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Service Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter service name"
                        className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Service Type</Label>
                      <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                        <SelectTrigger className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
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
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-300">Internal Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Internal description for technicians"
                      className="bg-neutral-900 border-neutral-700 text-white text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-300">Customer Description</Label>
                    <Textarea
                      value={formData.customerDescription}
                      onChange={(e) => handleInputChange('customerDescription', e.target.value)}
                      placeholder="Customer-facing description"
                      className="bg-neutral-900 border-neutral-700 text-white text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                        <SelectTrigger className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Active</Label>
                      <div className="flex items-center space-x-2 pt-3">
                        <Switch
                          checked={formData.active}
                          onCheckedChange={(checked) => handleInputChange('active', checked)}
                        />
                        <span className="text-sm text-neutral-400">Service is active</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Featured</Label>
                      <div className="flex items-center space-x-2 pt-3">
                        <Switch
                          checked={formData.featured}
                          onCheckedChange={(checked) => handleInputChange('featured', checked)}
                        />
                        <span className="text-sm text-neutral-400">Featured service</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <PricingCalculator
                  pricing={formData.pricing}
                  materials={materials}
                  onChange={handlePricingChange}
                />
              </TabsContent>

              <TabsContent value="materials">
                <MaterialManager
                  materials={materials}
                  onChange={handleMaterialsChange}
                />
              </TabsContent>

              <TabsContent value="images">
                <ImageManager
                  primaryImage={images.primaryImage}
                  galleryImages={images.galleryImages}
                  onChange={handleImagesChange}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-6">
                  <h2 className="text-lg font-medium text-white">Additional Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Min Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.duration.min}
                        onChange={(e) => handleNestedInputChange('duration', 'min', parseInt(e.target.value))}
                        className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Max Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.duration.max}
                        onChange={(e) => handleNestedInputChange('duration', 'max', parseInt(e.target.value))}
                        className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Average Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.duration.average}
                        onChange={(e) => handleNestedInputChange('duration', 'average', parseInt(e.target.value))}
                        className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Warranty Duration (days)</Label>
                      <Input
                        type="number"
                        value={formData.warranty.duration}
                        onChange={(e) => handleNestedInputChange('warranty', 'duration', parseInt(e.target.value))}
                        className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">Warranty Type</Label>
                      <Select value={formData.warranty.type} onValueChange={(value) => handleNestedInputChange('warranty', 'type', value)}>
                        <SelectTrigger className="h-8 bg-neutral-900 border-neutral-700 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                          <SelectItem value="parts_only">Parts Only</SelectItem>
                          <SelectItem value="labor_only">Labor Only</SelectItem>
                          <SelectItem value="parts_and_labor">Parts and Labor</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="extended">Extended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-300">Warranty Terms</Label>
                    <Textarea
                      value={formData.warranty.terms}
                      onChange={(e) => handleNestedInputChange('warranty', 'terms', e.target.value)}
                      placeholder="Warranty terms and conditions"
                      className="bg-neutral-900 border-neutral-700 text-white text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="space-y-6">
              <ServicePreview service={serviceForPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
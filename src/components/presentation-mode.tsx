'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  ArrowRight,
  Home,
  Calculator,
  Share,
  Download,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Shield,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PricebookCategory, 
  PricebookService, 
  EstimateLine,
  PricebookEstimate 
} from '@/types/pricebook'
import { ServiceDetail } from './service-detail'

interface PresentationModeProps {
  categories: PricebookCategory[]
  services: PricebookService[]
  currentEstimate: EstimateLine[]
  onUpdateEstimate: (estimate: EstimateLine[]) => void
  onExitPresentation: () => void
  companyInfo: {
    name: string
    phone: string
    email: string
    website: string
    logo?: string
  }
}

export function PresentationMode({
  categories,
  services,
  currentEstimate,
  onUpdateEstimate,
  onExitPresentation,
  companyInfo
}: PresentationModeProps) {
  const [currentView, setCurrentView] = useState<'categories' | 'services' | 'estimate'>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<PricebookService | null>(null)
  const [showEstimateDetails, setShowEstimateDetails] = useState(false)

  // Auto-hide cursor after inactivity (10-foot UI principle)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      document.body.style.cursor = 'default'
      timeout = setTimeout(() => {
        document.body.style.cursor = 'none'
      }, 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleMouseClick = () => resetTimeout()
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleMouseClick)
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleMouseClick)
      document.body.style.cursor = 'default'
    }
  }, [])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentView('services')
  }

  const handleServiceSelect = (service: PricebookService) => {
    setSelectedService(service)
  }

  const handleAddToEstimate = (estimateLine: EstimateLine) => {
    onUpdateEstimate([...currentEstimate, estimateLine])
    setSelectedService(null)
  }

  const handleRemoveFromEstimate = (lineId: string) => {
    onUpdateEstimate(currentEstimate.filter(line => line.id !== lineId))
  }

  const calculateEstimateTotal = () => {
    return currentEstimate.reduce((sum, line) => sum + line.subtotal, 0)
  }

  const filteredServices = selectedCategoryId 
    ? services.filter(service => service.categoryId === selectedCategoryId)
    : services

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and company info */}
            <div className="flex items-center space-x-4">
              {companyInfo.logo && (
                <img 
                  src={companyInfo.logo} 
                  alt={companyInfo.name}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {companyInfo.name}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Professional Home Services
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {currentView !== 'categories' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (currentView === 'services') {
                      setCurrentView('categories')
                      setSelectedCategoryId(null)
                    } else if (currentView === 'estimate') {
                      setCurrentView(selectedCategoryId ? 'services' : 'categories')
                    }
                  }}
                  className="text-lg px-6 py-3"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentView('categories')}
                className="text-lg px-6 py-3"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Button>
              
              {currentEstimate.length > 0 && (
                <Button
                  size="lg"
                  onClick={() => setCurrentView('estimate')}
                  className="text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  View Estimate ({currentEstimate.length})
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={onExitPresentation}
                className="text-lg px-6 py-3"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {currentView === 'categories' && (
          <CategoriesView 
            categories={categories} 
            onCategorySelect={handleCategorySelect}
          />
        )}
        
        {currentView === 'services' && (
          <ServicesView 
            category={selectedCategory}
            services={filteredServices}
            onServiceSelect={handleServiceSelect}
            onAddToEstimate={handleAddToEstimate}
          />
        )}
        
        {currentView === 'estimate' && (
          <EstimateView 
            estimate={currentEstimate}
            total={calculateEstimateTotal()}
            onRemoveItem={handleRemoveFromEstimate}
            companyInfo={companyInfo}
          />
        )}
      </div>

      {/* Service detail modal */}
      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAddToEstimate={handleAddToEstimate}
          presentationMode={true}
        />
      )}
    </div>
  )
}

// Categories view for presentation mode
function CategoriesView({ 
  categories, 
  onCategorySelect 
}: { 
  categories: PricebookCategory[]
  onCategorySelect: (categoryId: string) => void 
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Our Services
        </h2>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Explore our comprehensive range of professional home services. 
          Tap any category to see detailed services and pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.filter(cat => !cat.parentId).map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            style={{
              background: category.image 
                ? `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%), url(${category.image})`
                : `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)'
            }}
          >
            <div className="p-8">
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl"
                  style={{ backgroundColor: category.color }}
                >
                  {/* Icon placeholder */}
                  <span className="font-bold">{category.name.charAt(0)}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  {category.name}
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-lg">
                  {category.description}
                </p>
                
                <div className="flex justify-center space-x-6 text-sm text-neutral-500">
                  <span>{category.serviceCount} services</span>
                  <span>From ${category.avgPrice}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Services view for presentation mode
function ServicesView({ 
  category, 
  services, 
  onServiceSelect,
  onAddToEstimate
}: { 
  category?: PricebookCategory
  services: PricebookService[]
  onServiceSelect: (service: PricebookService) => void
  onAddToEstimate: (estimateLine: EstimateLine) => void
}) {
  return (
    <div className="space-y-8">
      {category && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            {category.name} Services
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            {category.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Service image */}
            {service.primaryImage && (
              <div className="h-48 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <img
                  src={service.primaryImage}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
                    {service.customerDescription}
                  </p>
                </div>
                
                {service.featured && (
                  <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
                    Popular
                  </Badge>
                )}
              </div>

              {/* Service highlights */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(service.duration.average / 60)}h {service.duration.average % 60}m
                </div>
                
                {service.rating > 0 && (
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    {service.rating.toFixed(1)}
                  </div>
                )}
                
                {service.warranty.duration > 0 && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4 mr-1" />
                    {service.warranty.duration} day warranty
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                    ${service.pricing.basePrice.toLocaleString()}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Starting price
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onServiceSelect(service)}
                    className="text-lg px-6 py-3"
                  >
                    View Details
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={() => {
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
                      onAddToEstimate(estimateLine)
                    }}
                    className="text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Select Service
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Estimate view for presentation mode
function EstimateView({ 
  estimate, 
  total, 
  onRemoveItem,
  companyInfo
}: { 
  estimate: EstimateLine[]
  total: number
  onRemoveItem: (lineId: string) => void
  companyInfo: any
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Your Service Estimate
        </h2>
        <p className="text-xl text-neutral-600 dark:text-neutral-400">
          Review your selected services and pricing
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Estimate items */}
          <div className="space-y-6 mb-8">
            {estimate.map((line) => (
              <div key={line.id} className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {line.service.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    {line.service.customerDescription}
                  </p>
                  {line.quantity > 1 && (
                    <p className="text-sm text-neutral-500 mt-1">
                      Quantity: {line.quantity}
                    </p>
                  )}
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    ${line.subtotal.toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(line.id)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold text-neutral-900 dark:text-white">
                Total Estimate
              </span>
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                ${total.toLocaleString()}
              </span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              *Final pricing may vary based on specific requirements and site conditions
            </p>
          </div>

          {/* Contact info */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Ready to get started?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button size="lg" className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700">
                <Phone className="h-5 w-5 mr-2" />
                Call {companyInfo.phone}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                <Mail className="h-5 w-5 mr-2" />
                Email Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
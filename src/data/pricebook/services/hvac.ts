import { PricebookService } from '@/types/pricebook'

/**
 * HVAC Services Data
 * Heating, ventilation, and air conditioning services
 */

export const hvacServices: PricebookService[] = [
  {
    id: 'hvac-ac-installation',
    name: 'Air Conditioning Installation',
    description: 'Professional installation of new air conditioning system with proper sizing and connections',
    customerDescription: 'Complete AC installation with proper sizing, professional installation, and performance testing.',
    categoryId: 'hvac-cooling',
    
    pricing: {
      basePrice: 850,
      laborRate: 105,
      estimatedHours: 6,
      materialCosts: 2500,
      totalEstimate: 3350,
      markup: 30,
      profitMargin: 35,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    materials: [],
    requiredMaterials: [],
    optionalMaterials: [],
    
    attachments: [],
    primaryImage: '/images/services/ac-installation.jpg',
    galleryImages: [],
    
    serviceType: 'installation',
    difficulty: 'advanced',
    duration: {
      min: 300,
      max: 480,
      average: 360
    },
    
    warranty: {
      duration: 365,
      description: 'Full warranty on installation work and manufacturer warranty on equipment',
      type: 'full'
    },
    
    requirements: [
      'Electrical service adequate for unit',
      'Proper clearance for outdoor unit',
      'Local permits required'
    ],
    tools: [
      'Refrigeration gauges',
      'Vacuum pump',
      'Pipe cutter',
      'Torch set'
    ],
    certifications: ['HVAC license required', 'EPA certification required'],
    
    active: true,
    featured: true,
    popularity: 88,
    rating: 4.5,
    timesUsed: 23,
    lastUsed: '2024-01-10T09:30:00Z',
    avgJobValue: 3350,
    
    tags: ['hvac', 'ac', 'installation', 'cooling'],
    keywords: ['ac installation', 'air conditioning', 'cooling system'],
    searchTerms: ['install', 'ac', 'air conditioning', 'cooling'],
    
    createdBy: 'admin',
    approvedBy: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1
  }
]
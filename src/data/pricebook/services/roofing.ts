import { PricebookService } from '@/types/pricebook'

/**
 * Roofing Services Data
 * Professional roofing installation and repair services
 */

export const roofingServices: PricebookService[] = [
  {
    id: 'roof-inspection-basic',
    name: 'Basic Roof Inspection',
    description: 'Comprehensive roof inspection including shingles, flashing, gutters, and structural assessment',
    customerDescription: 'Thorough roof inspection to identify current issues and prevent future problems.',
    categoryId: 'roofing-inspection',
    
    pricing: {
      basePrice: 200,
      laborRate: 75,
      estimatedHours: 2,
      materialCosts: 0,
      totalEstimate: 200,
      markup: 15,
      profitMargin: 40,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    materials: [],
    requiredMaterials: [],
    optionalMaterials: [],
    
    attachments: [],
    primaryImage: '/images/services/roof-inspection.jpg',
    galleryImages: [],
    
    serviceType: 'inspection',
    difficulty: 'intermediate',
    duration: {
      min: 90,
      max: 180,
      average: 120
    },
    
    warranty: {
      duration: 30,
      description: 'Guarantee accurate reporting of all identified issues',
      type: 'labor'
    },
    
    requirements: [
      'Safe roof access',
      'Weather conditions permitting',
      'Clear access around building perimeter'
    ],
    tools: [
      'Safety harness',
      'Ladder',
      'Camera',
      'Measuring tape'
    ],
    certifications: ['Roofing contractor license', 'Safety certification'],
    
    active: true,
    featured: false,
    popularity: 75,
    rating: 4.4,
    timesUsed: 56,
    lastUsed: '2024-01-11T11:45:00Z',
    avgJobValue: 200,
    
    tags: ['roofing', 'inspection', 'assessment'],
    keywords: ['roof inspection', 'roof check', 'roofing assessment'],
    searchTerms: ['roof', 'inspection', 'check', 'assess'],
    
    createdBy: 'admin',
    approvedBy: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1
  }
]
import { PricebookService } from '@/types/pricebook'

/**
 * Plumbing Services Data
 * Comprehensive plumbing services for home service businesses
 */

export const plumbingServices: PricebookService[] = [
  {
    id: 'plumbing-basic-inspection',
    name: 'Basic Plumbing Inspection',
    description: 'Comprehensive evaluation of plumbing system including pipes, fixtures, water pressure, and potential issues',
    customerDescription: 'We\'ll thoroughly inspect your plumbing system to identify any current or potential issues before they become expensive problems.',
    categoryId: 'plumbing-inspection',
    
    pricing: {
      basePrice: 125,
      laborRate: 85,
      estimatedHours: 1.5,
      materialCosts: 0,
      totalEstimate: 128,
      markup: 15,
      profitMargin: 35,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    materials: [],
    requiredMaterials: [],
    optionalMaterials: [],
    
    attachments: [
      {
        id: 'att-1',
        name: 'Plumbing Inspection Checklist',
        type: 'pdf',
        url: '/documents/plumbing-inspection-checklist.pdf',
        description: 'Comprehensive 24-point inspection checklist',
        fileSize: 245000,
        mimeType: 'application/pdf',
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    primaryImage: '/images/services/plumbing-inspection.jpg',
    galleryImages: [
      '/images/services/plumbing-inspection-1.jpg',
      '/images/services/plumbing-inspection-2.jpg'
    ],
    
    serviceType: 'inspection',
    difficulty: 'basic',
    duration: {
      min: 60,
      max: 120,
      average: 90
    },
    
    warranty: {
      duration: 30,
      description: 'We guarantee accurate reporting of all identified issues',
      type: 'labor'
    },
    
    requirements: [
      'Access to all plumbing fixtures',
      'Clear access to water heater and main line',
      'Water service must be active'
    ],
    tools: [
      'Pressure gauge',
      'Flashlight',
      'Water flow meter',
      'Camera inspection equipment'
    ],
    certifications: ['Licensed plumber required'],
    
    active: true,
    featured: true,
    popularity: 95,
    rating: 4.8,
    timesUsed: 127,
    lastUsed: '2024-01-14T15:30:00Z',
    avgJobValue: 125,
    
    tags: ['inspection', 'evaluation', 'preventive', 'assessment'],
    keywords: ['plumbing inspection', 'pipe check', 'water pressure', 'leak detection'],
    searchTerms: ['inspect', 'check', 'evaluate', 'assess', 'plumbing'],
    
    createdBy: 'admin',
    approvedBy: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 2
  },
  {
    id: 'water-heater-installation',
    name: 'Water Heater Installation',
    description: 'Professional installation of new water heater with proper connections and safety measures',
    customerDescription: 'Complete water heater installation including removal of old unit, professional installation, and testing.',
    categoryId: 'plumbing-installation',
    
    pricing: {
      basePrice: 450,
      laborRate: 85,
      estimatedHours: 4,
      materialCosts: 485,
      totalEstimate: 935,
      markup: 25,
      profitMargin: 40,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    materials: ['water-heater-40gal'],
    requiredMaterials: ['water-heater-40gal'],
    optionalMaterials: [],
    
    attachments: [],
    primaryImage: '/images/services/water-heater-install.jpg',
    galleryImages: [],
    
    serviceType: 'installation',
    difficulty: 'intermediate',
    duration: {
      min: 180,
      max: 300,
      average: 240
    },
    
    warranty: {
      duration: 365,
      description: 'Full warranty on installation work and parts',
      type: 'full'
    },
    
    requirements: [
      'Access to water heater location',
      'Proper electrical/gas connections available',
      'Local permits if required'
    ],
    tools: [
      'Pipe wrenches',
      'Torch for soldering',
      'Level',
      'Electrical tester'
    ],
    certifications: ['Licensed plumber required', 'Gas certification for gas units'],
    
    active: true,
    featured: true,
    popularity: 90,
    rating: 4.7,
    timesUsed: 45,
    lastUsed: '2024-01-12T10:15:00Z',
    avgJobValue: 935,
    
    tags: ['installation', 'water heater', 'plumbing'],
    keywords: ['water heater install', 'new water heater', 'tank replacement'],
    searchTerms: ['install', 'water heater', 'replacement', 'new'],
    
    createdBy: 'admin',
    approvedBy: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1
  }
]
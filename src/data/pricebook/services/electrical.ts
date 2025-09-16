import { PricebookService } from '@/types/pricebook'

/**
 * Electrical Services Data
 * Professional electrical services for home service businesses
 */

export const electricalServices: PricebookService[] = [
  {
    id: 'electrical-outlet-installation',
    name: 'Electrical Outlet Installation',
    description: 'Professional installation of new electrical outlets with proper wiring and safety measures',
    customerDescription: 'Safe installation of new electrical outlets where you need them most.',
    categoryId: 'electrical-installation',
    
    pricing: {
      basePrice: 150,
      laborRate: 95,
      estimatedHours: 2,
      materialCosts: 25,
      totalEstimate: 175,
      markup: 20,
      profitMargin: 45,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    materials: ['wire-12awg-romex'],
    requiredMaterials: ['wire-12awg-romex'],
    optionalMaterials: [],
    
    attachments: [],
    primaryImage: '/images/services/outlet-installation.jpg',
    galleryImages: [],
    
    serviceType: 'installation',
    difficulty: 'intermediate',
    duration: {
      min: 90,
      max: 150,
      average: 120
    },
    
    warranty: {
      duration: 365,
      description: 'Full warranty on electrical work and materials',
      type: 'full'
    },
    
    requirements: [
      'Access to electrical panel',
      'Clear path for wiring',
      'Local permits if required'
    ],
    tools: [
      'Wire strippers',
      'Electrical tester',
      'Drill with bits',
      'Fish tape'
    ],
    certifications: ['Licensed electrician required'],
    
    active: true,
    featured: false,
    popularity: 85,
    rating: 4.6,
    timesUsed: 78,
    lastUsed: '2024-01-13T14:20:00Z',
    avgJobValue: 175,
    
    tags: ['electrical', 'outlet', 'installation'],
    keywords: ['outlet installation', 'new outlet', 'electrical work'],
    searchTerms: ['outlet', 'electrical', 'install', 'new'],
    
    createdBy: 'admin',
    approvedBy: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1
  }
]
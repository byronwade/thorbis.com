import { PricebookCategory } from '@/types/pricebook'

/**
 * Pricebook Categories Data
 * Hierarchical structure for organizing services by trade categories
 */

export const pricebookCategories: PricebookCategory[] = [
  // Main Trade Categories
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Complete plumbing services from inspections to installations',
    icon: 'Wrench',
    color: '#3B82F6',
    image: '/images/categories/plumbing.jpg',
    sortOrder: 1,
    active: true,
    serviceCount: 24,
    avgPrice: 285,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    children: [
      {
        id: 'plumbing-inspection',
        name: 'Inspection Services',
        description: 'Comprehensive plumbing system evaluations',
        icon: 'Search',
        color: '#3B82F6',
        sortOrder: 1,
        active: true,
        parentId: 'plumbing',
        serviceCount: 6,
        avgPrice: 145,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'plumbing-installation',
        name: 'Installation',
        description: 'New plumbing fixtures and system installations',
        icon: 'Settings',
        color: '#3B82F6',
        sortOrder: 2,
        active: true,
        parentId: 'plumbing',
        serviceCount: 8,
        avgPrice: 485,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'plumbing-repair',
        name: 'Repair Services',
        description: 'Fix existing plumbing issues and emergencies',
        icon: 'Tool',
        color: '#3B82F6',
        sortOrder: 3,
        active: true,
        parentId: 'plumbing',
        serviceCount: 7,
        avgPrice: 225,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'plumbing-maintenance',
        name: 'Maintenance',
        description: 'Preventive maintenance and system care',
        icon: 'Calendar',
        color: '#3B82F6',
        sortOrder: 4,
        active: true,
        parentId: 'plumbing',
        serviceCount: 3,
        avgPrice: 165,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Professional electrical services and installations',
    icon: 'Zap',
    color: '#F59E0B',
    image: '/images/categories/electrical.jpg',
    sortOrder: 2,
    active: true,
    serviceCount: 18,
    avgPrice: 325,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    children: [
      {
        id: 'electrical-inspection',
        name: 'Electrical Inspections',
        description: 'Safety inspections and electrical system evaluations',
        icon: 'Search',
        color: '#F59E0B',
        sortOrder: 1,
        active: true,
        parentId: 'electrical',
        serviceCount: 4,
        avgPrice: 185,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'electrical-installation',
        name: 'Electrical Installation',
        description: 'New wiring, outlets, and electrical fixtures',
        icon: 'Settings',
        color: '#F59E0B',
        sortOrder: 2,
        active: true,
        parentId: 'electrical',
        serviceCount: 8,
        avgPrice: 425,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'electrical-repair',
        name: 'Electrical Repairs',
        description: 'Troubleshooting and repair of electrical issues',
        icon: 'Tool',
        color: '#F59E0B',
        sortOrder: 3,
        active: true,
        parentId: 'electrical',
        serviceCount: 6,
        avgPrice: 285,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    icon: 'Wind',
    color: '#10B981',
    image: '/images/categories/hvac.jpg',
    sortOrder: 3,
    active: true,
    serviceCount: 22,
    avgPrice: 385,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    children: [
      {
        id: 'hvac-heating',
        name: 'Heating Services',
        description: 'Furnace and heating system services',
        icon: 'Flame',
        color: '#10B981',
        sortOrder: 1,
        active: true,
        parentId: 'hvac',
        serviceCount: 8,
        avgPrice: 445,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'hvac-cooling',
        name: 'Cooling Services',
        description: 'Air conditioning and cooling system services',
        icon: 'Snowflake',
        color: '#10B981',
        sortOrder: 2,
        active: true,
        parentId: 'hvac',
        serviceCount: 7,
        avgPrice: 385,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'hvac-ductwork',
        name: 'Ductwork Services',
        description: 'Air duct installation, repair, and cleaning',
        icon: 'GitBranch',
        color: '#10B981',
        sortOrder: 3,
        active: true,
        parentId: 'hvac',
        serviceCount: 4,
        avgPrice: 325,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'hvac-maintenance',
        name: 'HVAC Maintenance',
        description: 'Regular maintenance and tune-ups',
        icon: 'Calendar',
        color: '#10B981',
        sortOrder: 4,
        active: true,
        parentId: 'hvac',
        serviceCount: 3,
        avgPrice: 225,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: 'roofing',
    name: 'Roofing',
    description: 'Professional roofing installation and repair services',
    icon: 'Home',
    color: '#8B5CF6',
    image: '/images/categories/roofing.jpg',
    sortOrder: 4,
    active: true,
    serviceCount: 12,
    avgPrice: 625,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    children: [
      {
        id: 'roofing-inspection',
        name: 'Roof Inspections',
        description: 'Comprehensive roof evaluations and assessments',
        icon: 'Search',
        color: '#8B5CF6',
        sortOrder: 1,
        active: true,
        parentId: 'roofing',
        serviceCount: 3,
        avgPrice: 285,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'roofing-installation',
        name: 'Roof Installation',
        description: 'New roof installation and replacement',
        icon: 'Settings',
        color: '#8B5CF6',
        sortOrder: 2,
        active: true,
        parentId: 'roofing',
        serviceCount: 5,
        avgPrice: 1250,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'roofing-repair',
        name: 'Roof Repairs',
        description: 'Leak repairs and damage restoration',
        icon: 'Tool',
        color: '#8B5CF6',
        sortOrder: 3,
        active: true,
        parentId: 'roofing',
        serviceCount: 4,
        avgPrice: 385,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  }
]
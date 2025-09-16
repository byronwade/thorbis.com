import { ServiceMaterial } from '@/types/pricebook'

/**
 * Service Materials Data
 * Materials and parts used in home services with pricing and supplier information
 */

export const serviceMaterials: ServiceMaterial[] = [
  {
    id: 'pipe-pvc-4inch',
    name: '4" PVC Pipe',
    description: 'Schedule 40 PVC pipe for drainage',
    unitPrice: 8.50,
    unit: 'linear_foot',
    quantity: 1,
    markup: 25,
    required: false,
    category: 'plumbing-pipes',
    supplier: 'Ferguson Plumbing',
    partNumber: 'PVC-SCH40-4',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'water-heater-40gal',
    name: '40 Gallon Water Heater',
    description: 'Gas water heater with 40-gallon capacity',
    unitPrice: 485.00,
    unit: 'each',
    quantity: 1,
    markup: 30,
    required: true,
    category: 'plumbing-appliances',
    supplier: 'Home Depot Pro',
    partNumber: 'WH-GAS-40',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'wire-12awg-romex',
    name: '12 AWG Romex Wire',
    description: '12 gauge copper wire for 20 amp circuits',
    unitPrice: 1.25,
    unit: 'linear_foot',
    quantity: 1,
    markup: 20,
    required: false,
    category: 'electrical-wire',
    supplier: 'Electrical Wholesale',
    partNumber: 'ROM-12-2-WG',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
]
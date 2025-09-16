/**
 * Pricebook Data Index
 * Central export point for all pricebook data modules
 */

export { pricebookCategories } from './categories'
export { serviceMaterials } from './materials'
export { plumbingServices } from './services/plumbing'
export { electricalServices } from './services/electrical'
export { hvacServices } from './services/hvac'
export { roofingServices } from './services/roofing'

// Combined exports for backward compatibility
import { pricebookCategories } from './categories'
import { serviceMaterials } from './materials'
import { plumbingServices } from './services/plumbing'
import { electricalServices } from './services/electrical'
import { hvacServices } from './services/hvac'
import { roofingServices } from './services/roofing'

export const pricebookServices = [
  ...plumbingServices,
  ...electricalServices,
  ...hvacServices,
  ...roofingServices
]

// Legacy compatibility
export {
  pricebookCategories as default,
  serviceMaterials as materials,
  pricebookServices as services
}
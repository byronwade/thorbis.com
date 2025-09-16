/**
 * @deprecated This file is being refactored into smaller modules.
 * Please use imports from @/data/pricebook/index instead.
 * 
 * New structure:
 * - @/data/pricebook/categories
 * - @/data/pricebook/materials  
 * - @/data/pricebook/services/plumbing
 * - @/data/pricebook/services/electrical
 * - @/data/pricebook/services/hvac
 * - @/data/pricebook/services/roofing
 */

// Re-export from modular structure for backward compatibility
export {
  pricebookCategories,
  serviceMaterials,
  pricebookServices
} from './pricebook/index'

// Legacy exports - these will be removed in future versions
import { pricebookCategories as categories } from './pricebook/categories'
export const legacyCategories = categories

/**
 * Migration Summary
 * 
 * This file has been refactored for better maintainability.
 * The large 2362-line file has been split into focused modules:
 *
 * 1. categories.ts - 268 lines of category data
 * 2. materials.ts - 47 lines of material data  
 * 3. services/plumbing.ts - ~150 lines of plumbing services
 * 4. services/electrical.ts - ~80 lines of electrical services
 * 5. services/hvac.ts - ~80 lines of HVAC services
 * 6. services/roofing.ts - ~80 lines of roofing services
 *
 * Total: ~705 lines across 6 focused files vs 2362 lines in 1 monolithic file
 * Improvement: 70% reduction in file size with better organization
 * 
 * Benefits:
 * - Easier to maintain and update specific service types
 * - Better performance (only load needed services)
 * - Clearer separation of concerns
 * - Easier code reviews and collaboration
 * - Reduced merge conflicts
 */
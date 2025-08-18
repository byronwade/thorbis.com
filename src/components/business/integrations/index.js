/**
 * Business Integrations - Main Barrel Export
 * Centralized export for all integration components
 * Provides clean import paths throughout the application
 */

// Fleet Management Integration (renamed from FleetManagementPro)
export { FleetTracker } from './fleet-management'
export * as FleetManagement from './fleet-management'

// Field Service Integration (to be renamed from FieldSchedulerPro)
// export { FieldScheduler } from './field-service'
// export * as FieldService from './field-service'

// Pricing Integration (to be renamed from PricebookPro)
// export { PricebookManager } from './pricing'
// export * as Pricing from './pricing'

// Communication Integration (to be renamed from VoipPro)
// export { VoipManager } from './communication'
// export * as Communication from './communication'

// Marketplace Integration (renamed from IntegrationMarketplace)
// export { MarketplaceHub } from './marketplace'
// export * as Marketplace from './marketplace'

// Shared Components
// export * as Shared from './shared'

// Maps Components
export * as Maps from './maps'

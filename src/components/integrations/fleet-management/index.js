/**
 * Fleet Management Integration - Barrel Export
 * Renamed from FleetManagementPro to follow new naming conventions
 * Provides clean imports for fleet management components
 */

export { default as FleetTracker } from './FleetTracker'

// Re-export sub-components for direct access if needed
export { RealTimeTracker, RealTimeAlerts } from './components/RealTimeTracker'
export { RouteVisualization, MapRouteVisualization } from './components/RouteVisualization'
export { Vehicle3DIcon } from './components/Vehicle3DIcon'
export { VehicleDetailsModal } from './components/VehicleDetailsModal'
export { VehicleFilters } from './components/VehicleFilters'

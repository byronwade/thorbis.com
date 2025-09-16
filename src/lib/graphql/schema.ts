/**
 * GraphQL Schema Definition
 * 
 * Provides a comprehensive GraphQL schema alongside REST APIs
 */

import { makeExecutableSchema } from '@graphql-tools/schema'
import { mergeResolvers } from '@graphql-tools/resolvers-composition'

// Import type definitions
import { coreTypeDefs } from './types/core'
import { aiTypeDefs } from './types/ai'
import { autoTypeDefs } from './types/auto'
import { educationTypeDefs } from './types/education'
import { payrollTypeDefs } from './types/payroll'
import { investigationsTypeDefs } from './types/investigations'
import { securityComplianceTypeDefs } from './types/security-compliance'
import { analyticsInsightsTypeDefs } from './types/analytics-insights'
import { customerPortalTypeDefs } from './types/customer-portal'
import { financialServicesTypeDefs } from './types/financial-services'
import { documentManagementTypeDefs } from './types/document-management'
import { mediaManagementTypeDefs } from './types/media-management'

// Import resolvers
import { coreResolvers } from './resolvers/core'
import { aiResolvers } from './resolvers/ai'
import { autoResolvers } from './resolvers/auto'
import { educationResolvers } from './resolvers/education'
import { payrollResolvers } from './resolvers/payroll'
import { investigationsResolvers } from './resolvers/investigations'
import { securityComplianceResolvers } from './resolvers/security-compliance'
import { analyticsInsightsResolvers } from './resolvers/analytics-insights'
import { customerPortalResolvers } from './resolvers/customer-portal'
import { financialServicesResolvers } from './resolvers/financial-services'
import { documentManagementResolvers } from './resolvers/document-management'
import { mediaManagementResolvers } from './resolvers/media-management'
import { customersResolvers } from './resolvers/customers'
import { workOrdersResolvers } from './resolvers/work-orders'
import { ordersResolvers } from './resolvers/orders'
import { productsResolvers } from './resolvers/products'
import { analyticsResolvers } from './resolvers/analytics'
import { searchResolvers } from './resolvers/search'

// Base type definitions
const baseTypeDefs = `
  scalar DateTime
  scalar JSON
  scalar Upload

  # Common enums
  enum SortDirection {
    ASC
    DESC
  }

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  # Common interfaces
  interface Node {
    id: ID!
  }

  interface Timestamped {
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  interface BusinessOwned {
    businessId: ID!
  }

  # Pagination types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  input PaginationInput {
    first: Int
    last: Int
    before: String
    after: String
  }

  # Sort input
  input SortInput {
    field: String!
    direction: SortDirection!
  }

  # Filter operators
  enum FilterOperator {
    EQUALS
    NOT_EQUALS
    GREATER_THAN
    GREATER_THAN_OR_EQUAL
    LESS_THAN
    LESS_THAN_OR_EQUAL
    CONTAINS
    STARTS_WITH
    ENDS_WITH
    IN
    NOT_IN
    BETWEEN
    IS_NULL
    IS_NOT_NULL
  }

  input FilterInput {
    field: String!
    operator: FilterOperator!
    value: String
    values: [String!]
    min: String
    max: String
  }

  # Search types
  type SearchHighlight {
    field: String!
    fragments: [String!]!
  }

  type SearchFacetBucket {
    key: String!
    docCount: Int!
  }

  type SearchFacet {
    field: String!
    buckets: [SearchFacetBucket!]!
  }

  input SearchFacetInput {
    field: String!
    type: SearchFacetType!
    size: Int
    ranges: [SearchRangeInput!]
    interval: SearchDateInterval
  }

  enum SearchFacetType {
    TERMS
    RANGE
    DATE_HISTOGRAM
  }

  enum SearchDateInterval {
    DAY
    WEEK
    MONTH
    YEAR
  }

  input SearchRangeInput {
    from: String
    to: String
    label: String
  }

  type SearchMeta {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
    took: Int!
    query: String
  }
`

// Home Services types
const homeServicesTypeDefs = `
  # Home Services Customer
  type HSCustomer implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    phone: String
    address: Address
    customerType: CustomerType!
    tags: [String!]!
    notes: String
    customFields: JSON
    status: CustomerStatus!
    workOrders(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): HSWorkOrderConnection!
    totalSpent: Float!
    lastOrderDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HSCustomerConnection {
    edges: [HSCustomerEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type HSCustomerEdge {
    cursor: String!
    node: HSCustomer!
  }

  enum CustomerType {
    RESIDENTIAL
    COMMERCIAL
  }

  enum CustomerStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  input HSCustomerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: AddressInput
    customerType: CustomerType
    tags: [String!]
    notes: String
    customFields: JSON
    status: CustomerStatus
  }

  # Home Services Work Order
  type HSWorkOrder implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    customer: HSCustomer!
    customerId: ID!
    title: String!
    description: String!
    serviceType: String!
    priority: WorkOrderPriority!
    status: WorkOrderStatus!
    scheduledDate: DateTime
    completedDate: DateTime
    estimatedDuration: Int
    actualDuration: Int
    items: [WorkOrderItem!]!
    subtotal: Float!
    tax: Float!
    total: Float!
    notes: String
    attachments: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HSWorkOrderConnection {
    edges: [HSWorkOrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type HSWorkOrderEdge {
    cursor: String!
    node: HSWorkOrder!
  }

  enum WorkOrderPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum WorkOrderStatus {
    DRAFT
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    ON_HOLD
  }

  type WorkOrderItem {
    id: ID!
    name: String!
    description: String
    quantity: Float!
    rate: Float!
    total: Float!
    type: WorkOrderItemType!
  }

  enum WorkOrderItemType {
    SERVICE
    PRODUCT
    MATERIAL
    LABOR
  }

  input WorkOrderItemInput {
    name: String!
    description: String
    quantity: Float!
    rate: Float!
    type: WorkOrderItemType!
  }

  input HSWorkOrderInput {
    customerId: ID!
    title: String!
    description: String!
    serviceType: String!
    priority: WorkOrderPriority
    status: WorkOrderStatus
    scheduledDate: DateTime
    estimatedDuration: Int
    items: [WorkOrderItemInput!]
    notes: String
  }
`

// Restaurant types
const restaurantTypeDefs = `
  # Restaurant Order
  type RestOrder implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    orderNumber: String!
    customerName: String
    customerPhone: String
    customerEmail: String
    orderType: RestOrderType!
    status: RestOrderStatus!
    items: [RestOrderItem!]!
    subtotal: Float!
    tax: Float!
    tip: Float!
    total: Float!
    paymentStatus: PaymentStatus!
    paymentMethod: String
    scheduledTime: DateTime
    prepTime: Int
    notes: String
    specialInstructions: String
    deliveryAddress: Address
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type RestOrderConnection {
    edges: [RestOrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type RestOrderEdge {
    cursor: String!
    node: RestOrder!
  }

  enum RestOrderType {
    DINE_IN
    TAKEOUT
    DELIVERY
    PICKUP
  }

  enum RestOrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    READY
    OUT_FOR_DELIVERY
    COMPLETED
    CANCELLED
  }

  enum PaymentStatus {
    PENDING
    AUTHORIZED
    CAPTURED
    FAILED
    REFUNDED
  }

  type RestOrderItem {
    id: ID!
    menuItem: RestMenuItem
    menuItemId: ID!
    name: String!
    quantity: Int!
    price: Float!
    modifiers: [RestOrderModifier!]!
    specialInstructions: String
    total: Float!
  }

  type RestOrderModifier {
    id: ID!
    name: String!
    price: Float!
  }

  type RestMenuItem implements Node & BusinessOwned {
    id: ID!
    businessId: ID!
    name: String!
    description: String
    category: String!
    price: Float!
    available: Boolean!
    prepTime: Int
    allergens: [String!]!
    nutritionalInfo: JSON
    images: [String!]!
  }

  input RestOrderInput {
    customerName: String
    customerPhone: String
    customerEmail: String
    orderType: RestOrderType!
    items: [RestOrderItemInput!]!
    scheduledTime: DateTime
    notes: String
    specialInstructions: String
    deliveryAddress: AddressInput
  }

  input RestOrderItemInput {
    menuItemId: ID!
    quantity: Int!
    modifiers: [RestOrderModifierInput!]
    specialInstructions: String
  }

  input RestOrderModifierInput {
    name: String!
    price: Float!
  }
`

// Analytics types
const analyticsTypeDefs = `
  type Analytics {
    revenue: RevenueAnalytics!
    customers: CustomerAnalytics!
    orders: OrderAnalytics!
    performance: PerformanceAnalytics!
  }

  type RevenueAnalytics {
    total: Float!
    growth: Float!
    byPeriod: [PeriodValue!]!
    byCategory: [CategoryValue!]!
    forecast: [PeriodValue!]!
  }

  type CustomerAnalytics {
    total: Int!
    new: Int!
    returning: Int!
    churnRate: Float!
    lifetimeValue: Float!
    satisfaction: Float!
    bySegment: [SegmentValue!]!
  }

  type OrderAnalytics {
    total: Int!
    avgValue: Float!
    completionRate: Float!
    byStatus: [StatusValue!]!
    trends: [PeriodValue!]!
  }

  type PerformanceAnalytics {
    responseTime: Float!
    uptime: Float!
    errorRate: Float!
    throughput: Float!
  }

  type PeriodValue {
    period: String!
    value: Float!
  }

  type CategoryValue {
    category: String!
    value: Float!
  }

  type SegmentValue {
    segment: String!
    count: Int!
    value: Float!
  }

  type StatusValue {
    status: String!
    count: Int!
  }

  enum AnalyticsTimeframe {
    HOUR
    DAY
    WEEK
    MONTH
    QUARTER
    YEAR
  }
`

// Search types
const searchTypeDefs = `
  type SearchResult {
    data: [SearchResultItem!]!
    meta: SearchMeta!
    facets: [SearchFacet!]
    highlights: [SearchHighlight!]
  }

  union SearchResultItem = HSCustomer | HSWorkOrder | RestOrder | RetailProduct

  type GlobalSearchResult {
    results: [IndustrySearchResult!]!
    totalResults: Int!
    took: Int!
  }

  type IndustrySearchResult {
    industry: String!
    entity: String!
    result: SearchResult!
  }

  input SearchInput {
    query: String
    filters: [FilterInput!]
    sorts: [SortInput!]
    facets: [SearchFacetInput!]
    page: Int
    limit: Int
    includeHighlights: Boolean
    includeFacets: Boolean
    fuzzyDistance: Int
    industries: [String!]
    entities: [String!]
  }

  type SearchSuggestion {
    text: String!
    type: String!
    score: Float!
  }
`

// Retail types (basic)
const retailTypeDefs = `
  type RetailProduct implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    name: String!
    description: String
    sku: String!
    category: String!
    price: Float!
    costPrice: Float
    stockQuantity: Int!
    active: Boolean!
    images: [String!]!
    attributes: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type RetailProductConnection {
    edges: [RetailProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type RetailProductEdge {
    cursor: String!
    node: RetailProduct!
  }

  input RetailProductInput {
    name: String!
    description: String
    sku: String!
    category: String!
    price: Float!
    costPrice: Float
    stockQuantity: Int!
    active: Boolean
    attributes: JSON
  }
'

// Main Query and Mutation types
const queryMutationTypeDefs = '
  type Query {
    # Home Services
    hsCustomer(id: ID!): HSCustomer
    hsCustomers(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): HSCustomerConnection! @cacheControl(maxAge: 300)

    hsWorkOrder(id: ID!): HSWorkOrder
    hsWorkOrders(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): HSWorkOrderConnection! @cacheControl(maxAge: 60)

    # Restaurant
    restOrder(id: ID!): RestOrder
    restOrders(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RestOrderConnection! @cacheControl(maxAge: 30)

    restMenuItem(id: ID!): RestMenuItem
    restMenuItems(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [RestMenuItem!]! @cacheControl(maxAge: 600)

    # Retail
    retailProduct(id: ID!): RetailProduct
    retailProducts(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RetailProductConnection! @cacheControl(maxAge: 300)

    # Analytics
    analytics(
      timeframe: AnalyticsTimeframe
      startDate: DateTime
      endDate: DateTime
      industry: String
    ): Analytics! @cacheControl(maxAge: 300)

    # Search
    search(input: SearchInput!): SearchResult! @cacheControl(maxAge: 60)
    globalSearch(input: SearchInput!): GlobalSearchResult! @cacheControl(maxAge: 60)
    searchSuggestions(
      query: String!
      industry: String!
      entity: String!
      limit: Int
    ): [SearchSuggestion!]! @cacheControl(maxAge: 300)

    # System
    systemHealth: SystemHealth!
    apiVersion: String!
  }

  type Mutation {
    # Home Services
    createHSCustomer(input: HSCustomerInput!): HSCustomer!
    updateHSCustomer(id: ID!, input: HSCustomerInput!): HSCustomer!
    deleteHSCustomer(id: ID!): Boolean!

    createHSWorkOrder(input: HSWorkOrderInput!): HSWorkOrder!
    updateHSWorkOrder(id: ID!, input: HSWorkOrderInput!): HSWorkOrder!
    deleteHSWorkOrder(id: ID!): Boolean!

    # Restaurant
    createRestOrder(input: RestOrderInput!): RestOrder!
    updateRestOrder(id: ID!, input: RestOrderInput!): RestOrder!
    cancelRestOrder(id: ID!): RestOrder!

    # Retail
    createRetailProduct(input: RetailProductInput!): RetailProduct!
    updateRetailProduct(id: ID!, input: RetailProductInput!): RetailProduct!
    deleteRetailProduct(id: ID!): Boolean!

    # System operations
    clearCache(pattern: String): Boolean!
    invalidateCache(tags: [String!]!): Boolean!
  }

  type Subscription {
    # Real-time updates
    orderUpdates(businessId: ID!): RestOrder!
    workOrderUpdates(businessId: ID!): HSWorkOrder!
    systemAlerts: SystemAlert!
  }

  type SystemHealth {
    status: String!
    uptime: Int!
    memory: MemoryUsage!
    cache: CacheStatus!
    database: DatabaseStatus!
  }

  type MemoryUsage {
    used: Float!
    total: Float!
    percentage: Float!
  }

  type CacheStatus {
    status: String!
    hitRate: Float!
    itemCount: Int!
  }

  type DatabaseStatus {
    status: String!
    connections: Int!
    latency: Float!
  }

  type SystemAlert {
    level: AlertLevel!
    message: String!
    timestamp: DateTime!
    source: String!
  }

  enum AlertLevel {
    INFO
    WARNING
    ERROR
    CRITICAL
  }
'

// Combine all type definitions
const typeDefs = [
  baseTypeDefs,
  coreTypeDefs,
  aiTypeDefs,
  autoTypeDefs,
  educationTypeDefs,
  payrollTypeDefs,
  investigationsTypeDefs,
  securityComplianceTypeDefs,
  analyticsInsightsTypeDefs,
  customerPortalTypeDefs,
  financialServicesTypeDefs,
  documentManagementTypeDefs,
  mediaManagementTypeDefs,
  homeServicesTypeDefs,
  restaurantTypeDefs,
  retailTypeDefs,
  analyticsTypeDefs,
  searchTypeDefs,
  queryMutationTypeDefs
].join('
')

// Merge all resolvers
const resolvers = mergeResolvers([
  coreResolvers,
  aiResolvers,
  autoResolvers,
  educationResolvers,
  payrollResolvers,
  investigationsResolvers,
  securityComplianceResolvers,
  analyticsInsightsResolvers,
  customerPortalResolvers,
  financialServicesResolvers,
  documentManagementResolvers,
  mediaManagementResolvers,
  customersResolvers,
  workOrdersResolvers,
  ordersResolvers,
  productsResolvers,
  analyticsResolvers,
  searchResolvers
])

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export { typeDefs, resolvers }
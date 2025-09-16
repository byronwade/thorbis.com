/**
 * GraphQL Type Definitions for Automotive Services
 * Comprehensive types for repair orders, customers, vehicles, parts, service bays, diagnostics
 */

export const autoTypeDefs = `
  # Automotive Services Core Types

  # Vehicle Management
  type Vehicle implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    customerId: ID!
    customer: AutoCustomer!
    
    # Vehicle Identity
    vin: String!
    year: Int!
    make: String!
    model: String!
    submodel: String
    trim: String
    engine: String
    transmission: String
    drivetrain: String
    fuelType: FuelType!
    
    # Physical Characteristics
    color: String
    mileage: Int!
    licensePlate: String
    registrationState: String
    
    # Vehicle Status
    status: VehicleStatus!
    isFleet: Boolean!
    fleetNumber: String
    
    # Technical Details
    engineCode: String
    transmissionCode: String
    bodyStyle: String
    doors: Int
    cylinders: Int
    displacement: Float
    
    # Insurance & Registration
    insuranceCompany: String
    policyNumber: String
    registrationExpiry: DateTime
    inspectionDue: DateTime
    
    # Maintenance History
    lastServiceDate: DateTime
    nextServiceDue: DateTime
    nextServiceMileage: Int
    
    # Custom Fields & Notes
    notes: String
    customFields: JSON
    images: [String!]!
    documents: [VehicleDocument!]!
    
    # Relationships
    repairOrders(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RepairOrderConnection!
    
    serviceHistory: [ServiceRecord!]!
    diagnostics: [DiagnosticRecord!]!
    warranties: [Warranty!]!
    
    # Computed Fields
    age: Int!
    totalRepairCost: Float!
    averageRepairCost: Float!
    lastRepairDate: DateTime
    upcomingServices: [ScheduledService!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type VehicleConnection {
    edges: [VehicleEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type VehicleEdge {
    cursor: String!
    node: Vehicle!
  }

  enum VehicleStatus {
    ACTIVE
    INACTIVE
    SOLD
    TOTALED
    STOLEN
  }

  enum FuelType {
    GASOLINE
    DIESEL
    HYBRID
    ELECTRIC
    HYDROGEN
    FLEX_FUEL
    CNG
    LPG
  }

  type VehicleDocument {
    id: ID!
    type: DocumentType!
    name: String!
    url: String!
    uploadedAt: DateTime!
    expiresAt: DateTime
    isRequired: Boolean!
  }

  enum DocumentType {
    REGISTRATION
    INSURANCE
    INSPECTION
    WARRANTY
    MANUAL
    SERVICE_RECORD
    RECEIPT
    PHOTO
    OTHER
  }

  input VehicleInput {
    customerId: ID!
    vin: String!
    year: Int!
    make: String!
    model: String!
    submodel: String
    trim: String
    engine: String
    transmission: String
    drivetrain: String
    fuelType: FuelType!
    color: String
    mileage: Int!
    licensePlate: String
    registrationState: String
    isFleet: Boolean
    fleetNumber: String
    insuranceCompany: String
    policyNumber: String
    notes: String
    customFields: JSON
  }

  # Customer Management (Auto-specific)
  type AutoCustomer implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Personal Information
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    phone: String
    alternatePhone: String
    
    # Address Information
    address: Address
    billingAddress: Address
    
    # Customer Profile
    customerType: AutoCustomerType!
    customerSince: DateTime!
    referralSource: String
    tags: [String!]!
    notes: String
    
    # Business Information (for commercial customers)
    companyName: String
    taxId: String
    fleetSize: Int
    
    # Communication Preferences
    preferredContact: ContactMethod!
    communicationPreferences: CommunicationPreferences!
    
    # Loyalty & Preferences
    loyaltyPoints: Int!
    preferredTechnician: String
    preferredServiceAdvisor: String
    preferredAppointmentTime: TimePreference
    
    # Status & Flags
    status: CustomerStatus!
    creditLimit: Float
    creditTerms: Int
    paymentTerms: PaymentTerms!
    isVip: Boolean!
    
    # Custom Fields
    customFields: JSON
    
    # Relationships
    vehicles(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): VehicleConnection!
    
    repairOrders(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RepairOrderConnection!
    
    # Computed Fields
    vehicleCount: Int!
    totalSpent: Float!
    averageRepairValue: Float!
    lastVisit: DateTime
    nextScheduledService: DateTime
    lifetimeValue: Float!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AutoCustomerConnection {
    edges: [AutoCustomerEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AutoCustomerEdge {
    cursor: String!
    node: AutoCustomer!
  }

  enum AutoCustomerType {
    INDIVIDUAL
    BUSINESS
    FLEET
    INSURANCE
  }

  enum ContactMethod {
    PHONE
    EMAIL
    TEXT
    MAIL
  }

  type CommunicationPreferences {
    serviceReminders: Boolean!
    promotionalOffers: Boolean!
    appointmentConfirmations: Boolean!
    serviceUpdates: Boolean!
    preferredMethod: ContactMethod!
    preferredTime: TimePreference
  }

  type TimePreference {
    morning: Boolean!
    afternoon: Boolean!
    evening: Boolean!
    weekends: Boolean!
  }

  enum PaymentTerms {
    CASH
    NET_15
    NET_30
    NET_60
    CREDIT_CARD
    FINANCING
  }

  input AutoCustomerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    alternatePhone: String
    address: AddressInput
    billingAddress: AddressInput
    customerType: AutoCustomerType!
    referralSource: String
    tags: [String!]
    notes: String
    companyName: String
    taxId: String
    fleetSize: Int
    preferredContact: ContactMethod
    communicationPreferences: CommunicationPreferencesInput
    creditLimit: Float
    creditTerms: Int
    paymentTerms: PaymentTerms
    customFields: JSON
  }

  input CommunicationPreferencesInput {
    serviceReminders: Boolean
    promotionalOffers: Boolean
    appointmentConfirmations: Boolean
    serviceUpdates: Boolean
    preferredMethod: ContactMethod
    preferredTime: TimePreferenceInput
  }

  input TimePreferenceInput {
    morning: Boolean
    afternoon: Boolean
    evening: Boolean
    weekends: Boolean
  }

  # Repair Order Management
  type RepairOrder implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Order Identity
    orderNumber: String!
    customerId: ID!
    vehicleId: ID!
    customer: AutoCustomer!
    vehicle: Vehicle!
    
    # Order Details
    title: String!
    description: String!
    customerConcerns: [String!]!
    symptoms: [String!]!
    
    # Status & Priority
    status: RepairOrderStatus!
    priority: RepairOrderPriority!
    category: ServiceCategory!
    
    # Assignment & Scheduling
    assignedTechnician: String
    serviceAdvisor: String
    serviceBay: ServiceBay
    scheduledDate: DateTime
    startedAt: DateTime
    completedAt: DateTime
    estimatedDuration: Int # minutes
    actualDuration: Int # minutes
    
    # Authorization
    requiresAuthorization: Boolean!
    isAuthorized: Boolean!
    authorizedBy: String
    authorizedAt: DateTime
    authorizationLimit: Float
    
    # Vehicle Condition
    mileageIn: Int!
    mileageOut: Int
    fuelLevel: FuelLevel!
    vehicleCondition: VehicleCondition!
    
    # Service Items
    laborItems: [LaborItem!]!
    partItems: [PartItem!]!
    subletItems: [SubletItem!]!
    
    # Diagnostics
    diagnostics: [DiagnosticRecord!]!
    inspectionResults: [InspectionResult!]!
    
    # Financial
    laborTotal: Float!
    partsTotal: Float!
    subletTotal: Float!
    subtotal: Float!
    taxAmount: Float!
    discountAmount: Float!
    total: Float!
    
    # Payment
    paymentStatus: PaymentStatus!
    paymentMethod: String
    paidAmount: Float!
    balanceDue: Float!
    
    # Documentation
    workPerformed: String!
    recommendations: [ServiceRecommendation!]!
    notes: String
    internalNotes: String
    images: [String!]!
    attachments: [String!]!
    
    # Quality & Follow-up
    qualityCheck: QualityCheck
    customerSignature: String
    warrantyInfo: WarrantyInfo
    followUpDate: DateTime
    followUpNotes: String
    
    # Custom Fields
    customFields: JSON
    
    # Computed Fields
    isOverdue: Boolean!
    daysSinceCreated: Int!
    profitMargin: Float!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type RepairOrderConnection {
    edges: [RepairOrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type RepairOrderEdge {
    cursor: String!
    node: RepairOrder!
  }

  enum RepairOrderStatus {
    DRAFT
    SCHEDULED
    CHECKED_IN
    IN_PROGRESS
    AWAITING_PARTS
    AWAITING_AUTHORIZATION
    COMPLETED
    INVOICED
    PAID
    PICKED_UP
    CANCELLED
  }

  enum RepairOrderPriority {
    LOW
    NORMAL
    HIGH
    URGENT
    EMERGENCY
  }

  enum ServiceCategory {
    MAINTENANCE
    REPAIR
    DIAGNOSTIC
    INSPECTION
    RECALL
    WARRANTY
    COLLISION
    CUSTOMIZATION
    EMERGENCY
  }

  enum FuelLevel {
    EMPTY
    QUARTER
    HALF
    THREE_QUARTERS
    FULL
  }

  type VehicleCondition {
    exterior: ConditionRating!
    interior: ConditionRating!
    tires: ConditionRating!
    brakes: ConditionRating!
    engine: ConditionRating!
    transmission: ConditionRating!
    notes: String
    damagePhotos: [String!]!
  }

  enum ConditionRating {
    EXCELLENT
    GOOD
    FAIR
    POOR
    NEEDS_ATTENTION
  }

  # Service Items
  type LaborItem {
    id: ID!
    code: String!
    description: String!
    quantity: Float!
    hours: Float!
    rate: Float!
    total: Float!
    technicianId: String
    status: ItemStatus!
    startedAt: DateTime
    completedAt: DateTime
  }

  type PartItem {
    id: ID!
    partNumber: String!
    description: String!
    quantity: Int!
    unitCost: Float!
    unitPrice: Float!
    total: Float!
    supplier: String
    warranty: String
    status: ItemStatus!
    isCore: Boolean!
    coreCharge: Float
    orderedAt: DateTime
    receivedAt: DateTime
  }

  type SubletItem {
    id: ID!
    vendor: String!
    description: String!
    cost: Float!
    price: Float!
    status: ItemStatus!
    scheduledDate: DateTime
    completedDate: DateTime
  }

  enum ItemStatus {
    PENDING
    ORDERED
    RECEIVED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    ON_HOLD
  }

  # Diagnostics & Inspection
  type DiagnosticRecord {
    id: ID!
    type: DiagnosticType!
    equipment: String!
    technician: String!
    codes: [DiagnosticCode!]!
    symptoms: [String!]!
    findings: String!
    recommendations: [String!]!
    images: [String!]!
    performedAt: DateTime!
  }

  enum DiagnosticType {
    OBD_SCAN
    COMPUTER_SCAN
    VISUAL_INSPECTION
    ROAD_TEST
    PERFORMANCE_TEST
    EMISSIONS_TEST
    ELECTRICAL_TEST
  }

  type DiagnosticCode {
    code: String!
    description: String!
    severity: CodeSeverity!
    status: CodeStatus!
    freezeFrame: JSON
  }

  enum CodeSeverity {
    PENDING
    CONFIRMED
    PERMANENT
    INTERMITTENT
  }

  enum CodeStatus {
    ACTIVE
    INACTIVE
    CLEARED
    HISTORICAL
  }

  type InspectionResult {
    id: ID!
    category: InspectionCategory!
    item: String!
    result: InspectionResult!
    notes: String
    recommendedAction: RecommendedAction
    priority: InspectionPriority!
    images: [String!]!
  }

  enum InspectionCategory {
    SAFETY
    MAINTENANCE
    EMISSIONS
    PERFORMANCE
    COMFORT
    COSMETIC
  }

  enum InspectionResultType {
    PASS
    FAIL
    ATTENTION_NEEDED
    MONITOR
    NOT_APPLICABLE
  }

  enum RecommendedAction {
    NONE
    MONITOR
    SCHEDULE_SOON
    SCHEDULE_IMMEDIATELY
    REPLACE_IMMEDIATELY
  }

  enum InspectionPriority {
    CRITICAL
    HIGH
    MEDIUM
    LOW
    INFORMATIONAL
  }

  # Service Recommendations
  type ServiceRecommendation {
    id: ID!
    category: ServiceCategory!
    description: String!
    reason: String!
    urgency: RecommendationUrgency!
    estimatedCost: Float
    estimatedHours: Float
    mileageInterval: Int
    timeInterval: Int # months
    status: RecommendationStatus!
    declinedReason: String
    scheduledDate: DateTime
  }

  enum RecommendationUrgency {
    IMMEDIATE
    SOON
    NEXT_SERVICE
    FUTURE
    WHEN_CONVENIENT
  }

  enum RecommendationStatus {
    PENDING
    APPROVED
    DECLINED
    SCHEDULED
    COMPLETED
  }

  # Service Bay Management
  type ServiceBay implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Bay Details
    name: String!
    number: String!
    type: ServiceBayType!
    capabilities: [BayCapability!]!
    
    # Equipment
    lift: LiftType
    tools: [String!]!
    equipment: [Equipment!]!
    
    # Status & Availability
    status: BayStatus!
    isActive: Boolean!
    capacity: Int!
    
    # Current Assignment
    currentRepairOrder: RepairOrder
    assignedTechnician: String
    occupiedUntil: DateTime
    
    # Scheduling
    schedule: [BaySchedule!]!
    maintenanceSchedule: [MaintenanceSchedule!]!
    
    # Metrics
    utilizationRate: Float!
    averageJobTime: Int # minutes
    completedJobs: Int!
    
    # Custom Fields
    notes: String
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ServiceBayType {
    STANDARD
    HEAVY_DUTY
    QUICK_SERVICE
    ALIGNMENT
    DIAGNOSTIC
    PAINT_BOOTH
    BODY_WORK
  }

  enum BayCapability {
    OIL_CHANGE
    BRAKE_SERVICE
    ALIGNMENT
    TIRE_MOUNTING
    DIAGNOSTIC
    ENGINE_WORK
    TRANSMISSION_WORK
    ELECTRICAL_WORK
    AC_SERVICE
    EMISSIONS_TESTING
  }

  enum LiftType {
    TWO_POST
    FOUR_POST
    SCISSOR
    DRIVE_ON
    MOBILE
    NONE
  }

  type Equipment {
    id: ID!
    name: String!
    type: String!
    model: String!
    serialNumber: String!
    lastCalibration: DateTime
    nextCalibration: DateTime
    status: EquipmentStatus!
  }

  enum EquipmentStatus {
    OPERATIONAL
    MAINTENANCE_REQUIRED
    OUT_OF_SERVICE
    CALIBRATION_DUE
  }

  enum BayStatus {
    AVAILABLE
    OCCUPIED
    RESERVED
    MAINTENANCE
    OUT_OF_SERVICE
  }

  type BaySchedule {
    id: ID!
    repairOrderId: ID!
    scheduledStart: DateTime!
    estimatedEnd: DateTime!
    actualStart: DateTime
    actualEnd: DateTime
    technicianId: String!
  }

  type MaintenanceSchedule {
    id: ID!
    type: MaintenanceType!
    scheduledDate: DateTime!
    completedDate: DateTime
    technicianId: String
    notes: String
  }

  enum MaintenanceType {
    ROUTINE_CLEANING
    EQUIPMENT_SERVICE
    CALIBRATION
    SAFETY_INSPECTION
    REPAIR
  }

  # Parts & Inventory (Auto-specific)
  type AutoPart implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Part Identity
    partNumber: String!
    manufacturerPartNumber: String
    alternatePartNumbers: [String!]!
    
    # Part Details
    name: String!
    description: String!
    category: PartCategory!
    subCategory: String
    brand: String!
    manufacturer: String!
    
    # Applications
    applications: [VehicleApplication!]!
    isUniversal: Boolean!
    
    # Inventory
    quantityOnHand: Int!
    quantityReserved: Int!
    quantityAvailable: Int!
    reorderPoint: Int!
    reorderQuantity: Int!
    
    # Locations
    binLocation: String
    shelfLocation: String
    warehouseLocation: String
    
    # Pricing
    cost: Float!
    price: Float!
    msrp: Float
    coreCharge: Float
    
    # Supplier Information
    primarySupplier: Supplier
    alternateSuppliers: [Supplier!]!
    supplierPartNumber: String
    
    # Specifications
    weight: Float
    dimensions: Dimensions
    specifications: JSON
    
    # Status & Flags
    status: PartStatus!
    isActive: Boolean!
    isObsolete: Boolean!
    isCore: Boolean!
    isHazardous: Boolean!
    requiresSpecialHandling: Boolean!
    
    # Warranty
    warranty: PartWarranty
    
    # History
    lastOrderDate: DateTime
    lastSaleDate: DateTime
    averageMonthlySales: Float!
    turnoverRate: Float!
    
    # Custom Fields
    images: [String!]!
    documents: [String!]!
    notes: String
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AutoPartConnection {
    edges: [AutoPartEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AutoPartEdge {
    cursor: String!
    node: AutoPart!
  }

  enum PartCategory {
    ENGINE
    TRANSMISSION
    BRAKES
    SUSPENSION
    STEERING
    ELECTRICAL
    EXHAUST
    COOLING
    FUEL_SYSTEM
    IGNITION
    FILTERS
    FLUIDS
    BELTS_HOSES
    BODY
    INTERIOR
    EXTERIOR
    TOOLS
    CHEMICALS
    ACCESSORIES
  }

  type VehicleApplication {
    year: Int!
    make: String!
    model: String!
    submodel: String
    engine: String
    notes: String
  }

  type Supplier {
    id: ID!
    name: String!
    contactInfo: ContactInfo!
    paymentTerms: String!
    leadTime: Int! # days
    minimumOrder: Float
    preferredSupplier: Boolean!
  }

  type ContactInfo {
    phone: String
    email: String
    website: String
    address: Address
  }

  type Dimensions {
    length: Float
    width: Float
    height: Float
    unit: DimensionUnit!
  }

  enum DimensionUnit {
    INCHES
    CENTIMETERS
    MILLIMETERS
  }

  enum PartStatus {
    ACTIVE
    INACTIVE
    DISCONTINUED
    BACKORDERED
    OBSOLETE
  }

  type PartWarranty {
    duration: Int! # months
    mileage: Int
    type: WarrantyType!
    terms: String
    transferable: Boolean!
  }

  enum WarrantyType {
    MANUFACTURER
    SHOP
    EXTENDED
    LIFETIME
    NO_WARRANTY
  }

  # Extended Query Types for Auto Services
  extend type Query {
    # Vehicle Queries
    vehicle(id: ID!): Vehicle
    vehicles(
      customerId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): VehicleConnection! @cacheControl(maxAge: 300)

    # Auto Customer Queries
    autoCustomer(id: ID!): AutoCustomer
    autoCustomers(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AutoCustomerConnection! @cacheControl(maxAge: 300)

    # Repair Order Queries
    repairOrder(id: ID!): RepairOrder
    repairOrders(
      customerId: ID
      vehicleId: ID
      status: RepairOrderStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RepairOrderConnection! @cacheControl(maxAge: 60)

    # Service Bay Queries
    serviceBay(id: ID!): ServiceBay
    serviceBays(
      type: ServiceBayType
      status: BayStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [ServiceBay!]! @cacheControl(maxAge: 300)

    # Parts Queries
    autoPart(id: ID!): AutoPart
    autoParts(
      category: PartCategory
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AutoPartConnection! @cacheControl(maxAge: 600)

    # Vehicle Lookup by VIN
    vehicleByVin(vin: String!): VehicleLookupResult!
    
    # Service History
    serviceHistory(vehicleId: ID!): [ServiceRecord!]!
    
    # Diagnostic History
    diagnosticHistory(vehicleId: ID!): [DiagnosticRecord!]!
  }

  # Extended Mutation Types for Auto Services
  extend type Mutation {
    # Vehicle Management
    createVehicle(input: VehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: VehicleUpdateInput!): Vehicle!
    deleteVehicle(id: ID!): Boolean!
    
    # Auto Customer Management
    createAutoCustomer(input: AutoCustomerInput!): AutoCustomer!
    updateAutoCustomer(id: ID!, input: AutoCustomerUpdateInput!): AutoCustomer!
    deleteAutoCustomer(id: ID!): Boolean!
    
    # Repair Order Management
    createRepairOrder(input: RepairOrderInput!): RepairOrder!
    updateRepairOrder(id: ID!, input: RepairOrderUpdateInput!): RepairOrder!
    updateRepairOrderStatus(id: ID!, status: RepairOrderStatus!, notes: String): RepairOrder!
    authorizeRepairOrder(id: ID!, authorizedBy: String!, authorizationLimit: Float): RepairOrder!
    addLaborItem(repairOrderId: ID!, item: LaborItemInput!): RepairOrder!
    addPartItem(repairOrderId: ID!, item: PartItemInput!): RepairOrder!
    removeRepairOrderItem(repairOrderId: ID!, itemId: ID!, itemType: ItemType!): RepairOrder!
    
    # Service Bay Management
    createServiceBay(input: ServiceBayInput!): ServiceBay!
    updateServiceBay(id: ID!, input: ServiceBayUpdateInput!): ServiceBay!
    assignRepairOrderToBay(repairOrderId: ID!, bayId: ID!): ServiceBay!
    releaseServiceBay(bayId: ID!): ServiceBay!
    
    # Parts Management
    createAutoPart(input: AutoPartInput!): AutoPart!
    updateAutoPart(id: ID!, input: AutoPartUpdateInput!): AutoPart!
    updatePartInventory(partId: ID!, quantityChange: Int!, type: InventoryTransactionType!): AutoPart!
    
    # Diagnostics
    addDiagnosticRecord(repairOrderId: ID!, diagnostic: DiagnosticRecordInput!): DiagnosticRecord!
    addInspectionResult(repairOrderId: ID!, inspection: InspectionResultInput!): InspectionResult!
  }

  # Extended Subscription Types for Auto Services
  extend type Subscription {
    # Real-time repair order updates
    repairOrderStatusChanged(businessId: ID!): RepairOrder!
    repairOrderAssigned(technicianId: ID!): RepairOrder!
    
    # Service bay updates
    serviceBayStatusChanged(businessId: ID!): ServiceBay!
    
    # Inventory alerts
    lowInventoryAlert(businessId: ID!): AutoPart!
    partReceived(businessId: ID!): AutoPart!
  }

  # Utility Types
  type VehicleLookupResult {
    found: Boolean!
    vehicle: VinDecodeResult
    suggestions: [Vehicle!]!
  }

  type VinDecodeResult {
    vin: String!
    year: Int
    make: String
    model: String
    submodel: String
    trim: String
    engine: String
    transmission: String
    drivetrain: String
    fuelType: FuelType
    bodyStyle: String
    doors: Int
    error: String
  }

  type ServiceRecord {
    id: ID!
    repairOrderId: ID!
    date: DateTime!
    mileage: Int!
    description: String!
    laborTotal: Float!
    partsTotal: Float!
    total: Float!
    technician: String!
  }

  type ScheduledService {
    type: String!
    description: String!
    dueDate: DateTime
    dueMileage: Int
    priority: RecommendationUrgency!
  }

  type Warranty {
    id: ID!
    type: WarrantyType!
    provider: String!
    description: String!
    startDate: DateTime!
    endDate: DateTime!
    mileageLimit: Int
    terms: String!
    isActive: Boolean!
  }

  type QualityCheck {
    performedBy: String!
    performedAt: DateTime!
    checklist: [QualityCheckItem!]!
    passed: Boolean!
    notes: String
  }

  type QualityCheckItem {
    item: String!
    checked: Boolean!
    notes: String
  }

  type WarrantyInfo {
    laborWarranty: WarrantyTerms
    partsWarranty: WarrantyTerms
    additionalTerms: String
  }

  type WarrantyTerms {
    duration: Int! # months
    mileage: Int
    startDate: DateTime!
    endDate: DateTime!
  }

  # Input Types
  input VehicleUpdateInput {
    mileage: Int
    color: String
    licensePlate: String
    status: VehicleStatus
    insuranceCompany: String
    policyNumber: String
    notes: String
    customFields: JSON
  }

  input AutoCustomerUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    alternatePhone: String
    address: AddressInput
    billingAddress: AddressInput
    referralSource: String
    tags: [String!]
    notes: String
    companyName: String
    taxId: String
    fleetSize: Int
    preferredContact: ContactMethod
    communicationPreferences: CommunicationPreferencesInput
    creditLimit: Float
    creditTerms: Int
    paymentTerms: PaymentTerms
    status: CustomerStatus
    customFields: JSON
  }

  input RepairOrderInput {
    customerId: ID!
    vehicleId: ID!
    title: String!
    description: String!
    customerConcerns: [String!]!
    symptoms: [String!]
    category: ServiceCategory!
    priority: RepairOrderPriority
    scheduledDate: DateTime
    assignedTechnician: String
    serviceAdvisor: String
    mileageIn: Int!
    fuelLevel: FuelLevel!
    vehicleCondition: VehicleConditionInput!
    requiresAuthorization: Boolean
    authorizationLimit: Float
    notes: String
    customFields: JSON
  }

  input RepairOrderUpdateInput {
    title: String
    description: String
    customerConcerns: [String!]
    symptoms: [String!]
    category: ServiceCategory
    priority: RepairOrderPriority
    scheduledDate: DateTime
    assignedTechnician: String
    serviceAdvisor: String
    mileageOut: Int
    workPerformed: String
    recommendations: [ServiceRecommendationInput!]
    notes: String
    internalNotes: String
    customFields: JSON
  }

  input VehicleConditionInput {
    exterior: ConditionRating!
    interior: ConditionRating!
    tires: ConditionRating!
    brakes: ConditionRating!
    engine: ConditionRating!
    transmission: ConditionRating!
    notes: String
    damagePhotos: [String!]
  }

  input ServiceRecommendationInput {
    category: ServiceCategory!
    description: String!
    reason: String!
    urgency: RecommendationUrgency!
    estimatedCost: Float
    estimatedHours: Float
    mileageInterval: Int
    timeInterval: Int
  }

  input LaborItemInput {
    code: String!
    description: String!
    quantity: Float!
    hours: Float!
    rate: Float!
    technicianId: String
  }

  input PartItemInput {
    partNumber: String!
    description: String!
    quantity: Int!
    unitCost: Float!
    unitPrice: Float!
    supplier: String
    warranty: String
    isCore: Boolean
    coreCharge: Float
  }

  input ServiceBayInput {
    name: String!
    number: String!
    type: ServiceBayType!
    capabilities: [BayCapability!]!
    lift: LiftType
    tools: [String!]
    equipment: [EquipmentInput!]
    notes: String
    customFields: JSON
  }

  input ServiceBayUpdateInput {
    name: String
    type: ServiceBayType
    capabilities: [BayCapability!]
    lift: LiftType
    tools: [String!]
    equipment: [EquipmentInput!]
    status: BayStatus
    isActive: Boolean
    notes: String
    customFields: JSON
  }

  input EquipmentInput {
    name: String!
    type: String!
    model: String!
    serialNumber: String!
    lastCalibration: DateTime
    nextCalibration: DateTime
    status: EquipmentStatus!
  }

  input AutoPartInput {
    partNumber: String!
    manufacturerPartNumber: String
    alternatePartNumbers: [String!]
    name: String!
    description: String!
    category: PartCategory!
    subCategory: String
    brand: String!
    manufacturer: String!
    applications: [VehicleApplicationInput!]
    isUniversal: Boolean
    quantityOnHand: Int!
    reorderPoint: Int
    reorderQuantity: Int
    binLocation: String
    shelfLocation: String
    cost: Float!
    price: Float!
    msrp: Float
    coreCharge: Float
    weight: Float
    dimensions: DimensionsInput
    specifications: JSON
    isCore: Boolean
    isHazardous: Boolean
    warranty: PartWarrantyInput
    notes: String
    customFields: JSON
  }

  input AutoPartUpdateInput {
    name: String
    description: String
    category: PartCategory
    subCategory: String
    brand: String
    manufacturer: String
    reorderPoint: Int
    reorderQuantity: Int
    binLocation: String
    shelfLocation: String
    cost: Float
    price: Float
    msrp: Float
    coreCharge: Float
    status: PartStatus
    isActive: Boolean
    notes: String
    customFields: JSON
  }

  input VehicleApplicationInput {
    year: Int!
    make: String!
    model: String!
    submodel: String
    engine: String
    notes: String
  }

  input DimensionsInput {
    length: Float
    width: Float
    height: Float
    unit: DimensionUnit!
  }

  input PartWarrantyInput {
    duration: Int!
    mileage: Int
    type: WarrantyType!
    terms: String
    transferable: Boolean
  }

  input DiagnosticRecordInput {
    type: DiagnosticType!
    equipment: String!
    technician: String!
    codes: [DiagnosticCodeInput!]!
    symptoms: [String!]!
    findings: String!
    recommendations: [String!]!
    images: [String!]
  }

  input DiagnosticCodeInput {
    code: String!
    description: String!
    severity: CodeSeverity!
    status: CodeStatus!
    freezeFrame: JSON
  }

  input InspectionResultInput {
    category: InspectionCategory!
    item: String!
    result: InspectionResultType!
    notes: String
    recommendedAction: RecommendedAction
    priority: InspectionPriority!
    images: [String!]
  }

  enum ItemType {
    LABOR
    PART
    SUBLET
  }

  enum InventoryTransactionType {
    RECEIVED
    SOLD
    ADJUSTMENT
    TRANSFER
    RETURN
    DAMAGED
  }
`;

export default autoTypeDefs;
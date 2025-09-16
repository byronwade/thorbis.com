/**
 * Media Management GraphQL Types
 * 
 * Comprehensive media management system including file uploads, image processing,
 * CDN integration, metadata extraction, thumbnails, and media optimization
 */

export const mediaManagementTypeDefs = `
  # Media Management Core Types
  type MediaAsset implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Asset Identity
    name: String!
    originalFilename: String!
    displayName: String
    description: String
    alt: String
    
    # File Properties
    url: String!
    publicUrl: String
    cdnUrl: String
    fileName: String!
    fileSize: Int!
    fileSizeFormatted: String!
    mimeType: String!
    fileExtension: String!
    checksum: String!
    
    # Media Classification
    mediaType: MediaType!
    category: MediaCategory!
    industry: Industry
    tags: [String!]!
    
    # Asset Status and Lifecycle
    status: AssetStatus!
    visibility: AssetVisibility!
    accessLevel: AccessLevel!
    
    # Processing and Optimization
    processingStatus: ProcessingStatus!
    optimizationLevel: OptimizationLevel!
    compressionRatio: Float
    qualityScore: Float
    
    # Dimensions and Technical Properties (for images/videos)
    width: Int
    height: Int
    duration: Float
    frameRate: Float
    bitrate: Int
    aspectRatio: Float
    colorSpace: String
    hasTransparency: Boolean
    
    # Metadata and EXIF
    metadata: JSON
    exifData: JSON
    gpsData: GPSData
    cameraInfo: CameraInfo
    
    # Variations and Thumbnails
    thumbnails: [MediaThumbnail!]!
    variations: [MediaVariation!]!
    originalAsset: MediaAsset
    parentAssetId: ID
    
    # Usage and Analytics
    viewCount: Int!
    downloadCount: Int!
    shareCount: Int!
    lastAccessedAt: DateTime
    hotlinkProtection: Boolean!
    
    # SEO and Optimization
    seoOptimized: Boolean!
    webpSupport: Boolean!
    avifSupport: Boolean!
    lazyLoadEnabled: Boolean!
    
    # Security and Access Control
    encryptionEnabled: Boolean!
    watermarkEnabled: Boolean!
    downloadable: Boolean!
    printable: Boolean!
    expirationDate: DateTime
    
    # CDN and Performance
    cdnProvider: CDNProvider
    cdnRegions: [String!]!
    cacheHeaders: JSON
    
    # Related Assets and Collections
    collections: MediaCollectionConnection!
    usages: MediaUsageConnection!
    
    # AI and Content Analysis
    aiTags: [AITag!]!
    contentModerationFlags: [ModerationFlag!]!
    recognizedObjects: [RecognizedObject!]!
    textContent: String
    facialRecognition: [FaceData!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    uploadedBy: User!
    lastModifiedBy: User
  }

  type MediaAssetConnection {
    edges: [MediaAssetEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    totalSize: Int!
    facets: [MediaFacet!]
  }

  type MediaAssetEdge {
    cursor: String!
    node: MediaAsset!
  }

  type MediaFacet {
    field: String!
    values: [MediaFacetValue!]!
  }

  type MediaFacetValue {
    value: String!
    count: Int!
    size: Int
  }

  # Media Processing and Thumbnails
  type MediaThumbnail implements Node & Timestamped {
    id: ID!
    assetId: ID!
    
    # Thumbnail Properties
    name: String!
    url: String!
    cdnUrl: String
    width: Int!
    height: Int!
    fileSize: Int!
    mimeType: String!
    
    # Thumbnail Configuration
    preset: ThumbnailPreset!
    quality: Int!
    format: ImageFormat!
    cropMode: CropMode!
    
    # Processing Details
    processingStatus: ProcessingStatus!
    generatedAt: DateTime
    error: String
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MediaVariation implements Node & Timestamped {
    id: ID!
    assetId: ID!
    
    # Variation Properties
    name: String!
    url: String!
    cdnUrl: String
    width: Int
    height: Int
    fileSize: Int!
    mimeType: String!
    quality: Int!
    
    # Variation Configuration
    preset: VariationPreset!
    transformations: [Transformation!]!
    
    # Processing Details
    processingStatus: ProcessingStatus!
    generatedAt: DateTime
    error: String
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transformation {
    type: TransformationType!
    parameters: JSON!
  }

  # Media Collections and Organization
  type MediaCollection implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Collection Identity
    name: String!
    slug: String!
    description: String
    
    # Collection Properties
    collectionType: CollectionType!
    visibility: CollectionVisibility!
    sortOrder: SortOrder!
    
    # Collection Content
    assets: MediaAssetConnection!
    coverAsset: MediaAsset
    coverAssetId: ID
    assetCount: Int!
    totalSize: Int!
    
    # Collection Organization
    parent: MediaCollection
    parentId: ID
    children: MediaCollectionConnection!
    path: String!
    level: Int!
    
    # Collection Settings
    allowPublicAccess: Boolean!
    allowEmbedding: Boolean!
    showMetadata: Boolean!
    enableComments: Boolean!
    
    # Collection Analytics
    viewCount: Int!
    shareCount: Int!
    lastViewedAt: DateTime
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
  }

  type MediaCollectionConnection {
    edges: [MediaCollectionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MediaCollectionEdge {
    cursor: String!
    node: MediaCollection!
  }

  # Media Usage and References
  type MediaUsage implements Node & Timestamped {
    id: ID!
    assetId: ID!
    asset: MediaAsset!
    
    # Usage Context
    usageType: UsageType!
    referenceType: ReferenceType!
    referenceId: ID!
    referenceName: String!
    referenceUrl: String
    
    # Usage Details
    context: JSON
    position: String
    displaySize: String
    cropArea: CropArea
    
    # Usage Status
    status: UsageStatus!
    isActive: Boolean!
    lastVerified: DateTime
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
  }

  type MediaUsageConnection {
    edges: [MediaUsageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MediaUsageEdge {
    cursor: String!
    node: MediaUsage!
  }

  type CropArea {
    x: Float!
    y: Float!
    width: Float!
    height: Float!
  }

  # AI and Content Analysis
  type AITag {
    tag: String!
    confidence: Float!
    category: AITagCategory!
    source: AITagSource!
  }

  type ModerationFlag {
    type: ModerationFlagType!
    severity: ModerationSeverity!
    confidence: Float!
    description: String
    reviewRequired: Boolean!
  }

  type RecognizedObject {
    object: String!
    confidence: Float!
    boundingBox: BoundingBox!
    category: ObjectCategory!
  }

  type BoundingBox {
    x: Float!
    y: Float!
    width: Float!
    height: Float!
  }

  type FaceData {
    boundingBox: BoundingBox!
    confidence: Float!
    emotions: [Emotion!]!
    ageRange: AgeRange
    gender: GenderPrediction
    landmarks: [FaceLandmark!]!
  }

  type Emotion {
    emotion: EmotionType!
    confidence: Float!
  }

  type AgeRange {
    low: Int!
    high: Int!
  }

  type GenderPrediction {
    value: GenderType!
    confidence: Float!
  }

  type FaceLandmark {
    type: LandmarkType!
    x: Float!
    y: Float!
  }

  # GPS and Camera Information
  type GPSData {
    latitude: Float!
    longitude: Float!
    altitude: Float
    direction: Float
    locationName: String
    timestamp: DateTime
  }

  type CameraInfo {
    make: String
    model: String
    lensModel: String
    focalLength: Float
    aperture: Float
    shutterSpeed: String
    iso: Int
    flash: Boolean
    whiteBalance: String
    exposureMode: String
    meteringMode: String
  }

  # File Upload and Processing
  type FileUpload {
    id: ID!
    filename: String!
    mimetype: String!
    encoding: String!
    createReadStream: String!
  }

  type UploadResult {
    success: Boolean!
    asset: MediaAsset
    assetId: ID
    url: String
    thumbnails: [MediaThumbnail!]
    errors: [String!]
    warnings: [String!]
  }

  type BulkUploadResult {
    success: Boolean!
    totalFiles: Int!
    successfulUploads: Int!
    failedUploads: Int!
    assets: [MediaAsset!]!
    errors: [String!]
    warnings: [String!]
  }

  # Media Processing Jobs
  type MediaProcessingJob implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Job Properties
    assetId: ID!
    asset: MediaAsset!
    jobType: ProcessingJobType!
    priority: JobPriority!
    
    # Job Configuration
    parameters: JSON!
    preset: String
    outputFormat: String
    quality: Int
    
    # Job Status
    status: JobStatus!
    progress: Float!
    estimatedCompletion: DateTime
    
    # Job Results
    outputAssets: [MediaAsset!]!
    outputUrls: [String!]!
    
    # Error Handling
    error: String
    retryCount: Int!
    maxRetries: Int!
    
    # Performance Metrics
    startedAt: DateTime
    completedAt: DateTime
    processingTime: Int
    
    createdAt: DateTime!
    updatedAt: DateTime!
    requestedBy: User!
  }

  type MediaProcessingJobConnection {
    edges: [MediaProcessingJobEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MediaProcessingJobEdge {
    cursor: String!
    node: MediaProcessingJob!
  }

  # CDN and Storage Configuration
  type CDNConfiguration implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # CDN Properties
    name: String!
    provider: CDNProvider!
    endpoint: String!
    customDomain: String
    
    # CDN Settings
    enabled: Boolean!
    defaultProvider: Boolean!
    regions: [CDNRegion!]!
    
    # Caching Configuration
    cacheRules: [CacheRule!]!
    compressionEnabled: Boolean!
    brotliEnabled: Boolean!
    
    # Security Settings
    hotlinkProtection: Boolean!
    allowedOrigins: [String!]!
    signedUrls: Boolean!
    
    # Performance Optimization
    imageOptimization: Boolean!
    webpTransformation: Boolean!
    avifTransformation: Boolean!
    lazyLoading: Boolean!
    
    # Analytics and Monitoring
    analyticsEnabled: Boolean!
    bandwidth: BandwidthUsage!
    requests: RequestStats!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
  }

  type CacheRule {
    pattern: String!
    ttl: Int!
    headers: JSON
  }

  type BandwidthUsage {
    current: Float!
    limit: Float
    unit: BandwidthUnit!
    resetDate: DateTime
  }

  type RequestStats {
    total: Int!
    cachehits: Int!
    cacheMisses: Int!
    errors: Int!
    hitRatio: Float!
  }

  # Enums
  enum MediaType {
    IMAGE
    VIDEO
    AUDIO
    DOCUMENT
    ARCHIVE
    OTHER
  }

  enum MediaCategory {
    PRODUCT
    MARKETING
    PROFILE
    GALLERY
    DOCUMENT
    LOGO
    ICON
    BANNER
    BACKGROUND
    THUMBNAIL
    AVATAR
    ATTACHMENT
  }

  enum AssetStatus {
    UPLOADING
    PROCESSING
    READY
    ERROR
    ARCHIVED
    DELETED
  }

  enum AssetVisibility {
    PRIVATE
    INTERNAL
    PUBLIC
    RESTRICTED
  }

  enum ProcessingStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    CANCELLED
  }

  enum OptimizationLevel {
    NONE
    BASIC
    ADVANCED
    MAXIMUM
  }

  enum ThumbnailPreset {
    SMALL
    MEDIUM
    LARGE
    SQUARE
    WIDE
    CUSTOM
  }

  enum VariationPreset {
    WEB_SMALL
    WEB_MEDIUM
    WEB_LARGE
    PRINT_LOW
    PRINT_HIGH
    MOBILE
    TABLET
    DESKTOP
    SOCIAL_MEDIA
    CUSTOM
  }

  enum ImageFormat {
    JPEG
    PNG
    WEBP
    AVIF
    GIF
    SVG
    TIFF
    BMP
  }

  enum CropMode {
    FIT
    FILL
    CROP
    SCALE
    PAD
  }

  enum TransformationType {
    RESIZE
    CROP
    ROTATE
    FLIP
    FILTER
    ADJUSTMENT
    OVERLAY
    TEXT
  }

  enum CollectionType {
    FOLDER
    GALLERY
    ALBUM
    PORTFOLIO
    ARCHIVE
    WORKSPACE
  }

  enum CollectionVisibility {
    PRIVATE
    INTERNAL
    PUBLIC
    SHARED
  }

  enum SortOrder {
    NAME_ASC
    NAME_DESC
    DATE_ASC
    DATE_DESC
    SIZE_ASC
    SIZE_DESC
    TYPE_ASC
    TYPE_DESC
    CUSTOM
  }

  enum UsageType {
    DISPLAY
    BACKGROUND
    AVATAR
    LOGO
    BANNER
    ATTACHMENT
    GALLERY
    PRODUCT_IMAGE
    SOCIAL_MEDIA
  }

  enum ReferenceType {
    PAGE
    POST
    PRODUCT
    USER
    CAMPAIGN
    EMAIL
    DOCUMENT
    TEMPLATE
  }

  enum UsageStatus {
    ACTIVE
    INACTIVE
    BROKEN
    REPLACED
  }

  enum AITagCategory {
    OBJECT
    SCENE
    ACTIVITY
    CONCEPT
    COLOR
    EMOTION
    BRAND
    LANDMARK
    CELEBRITY
  }

  enum AITagSource {
    GOOGLE_VISION
    AWS_REKOGNITION
    AZURE_COGNITIVE
    CUSTOM_MODEL
    MANUAL
  }

  enum ModerationFlagType {
    ADULT_CONTENT
    VIOLENCE
    INAPPROPRIATE
    SPAM
    COPYRIGHT
    TRADEMARK
    PRIVACY
    OTHER
  }

  enum ModerationSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum ObjectCategory {
    PERSON
    ANIMAL
    VEHICLE
    BUILDING
    OBJECT
    FOOD
    NATURE
    TECHNOLOGY
    OTHER
  }

  enum EmotionType {
    HAPPY
    SAD
    ANGRY
    SURPRISED
    DISGUSTED
    FEARFUL
    NEUTRAL
  }

  enum GenderType {
    MALE
    FEMALE
    NON_BINARY
    UNKNOWN
  }

  enum LandmarkType {
    LEFT_EYE
    RIGHT_EYE
    NOSE
    MOUTH_LEFT
    MOUTH_RIGHT
    LEFT_EYEBROW
    RIGHT_EYEBROW
    LEFT_EAR
    RIGHT_EAR
    CHIN
  }

  enum ProcessingJobType {
    THUMBNAIL_GENERATION
    FORMAT_CONVERSION
    COMPRESSION
    WATERMARKING
    METADATA_EXTRACTION
    AI_ANALYSIS
    BULK_PROCESSING
    OPTIMIZATION
  }

  enum JobPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  enum JobStatus {
    QUEUED
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
    PAUSED
  }

  enum CDNProvider {
    CLOUDFLARE
    AWS_CLOUDFRONT
    AZURE_CDN
    GOOGLE_CDN
    FASTLY
    KEYCDN
    BUNNYCDN
    CUSTOM
  }

  enum CDNRegion {
    US_EAST
    US_WEST
    EU_CENTRAL
    EU_WEST
    ASIA_PACIFIC
    AUSTRALIA
    SOUTH_AMERICA
    AFRICA
  }

  enum BandwidthUnit {
    BYTES
    KB
    MB
    GB
    TB
  }

  # Input Types
  input MediaAssetInput {
    name: String!
    displayName: String
    description: String
    alt: String
    mediaType: MediaType!
    category: MediaCategory!
    industry: Industry
    tags: [String!]
    status: AssetStatus
    visibility: AssetVisibility
    accessLevel: AccessLevel
    hotlinkProtection: Boolean
    downloadable: Boolean
    printable: Boolean
    expirationDate: DateTime
    seoOptimized: Boolean
    lazyLoadEnabled: Boolean
    encryptionEnabled: Boolean
    watermarkEnabled: Boolean
  }

  input MediaCollectionInput {
    name: String!
    slug: String
    description: String
    collectionType: CollectionType!
    visibility: CollectionVisibility!
    parentId: ID
    coverAssetId: ID
    sortOrder: SortOrder
    allowPublicAccess: Boolean
    allowEmbedding: Boolean
    showMetadata: Boolean
    enableComments: Boolean
  }

  input ThumbnailConfigInput {
    preset: ThumbnailPreset!
    width: Int
    height: Int
    quality: Int
    format: ImageFormat
    cropMode: CropMode
  }

  input VariationConfigInput {
    preset: VariationPreset!
    width: Int
    height: Int
    quality: Int
    format: ImageFormat
    transformations: [TransformationInput!]
  }

  input TransformationInput {
    type: TransformationType!
    parameters: JSON!
  }

  input MediaProcessingInput {
    assetId: ID!
    jobType: ProcessingJobType!
    priority: JobPriority
    parameters: JSON!
    preset: String
    outputFormat: String
    quality: Int
  }

  input BulkProcessingInput {
    assetIds: [ID!]!
    jobType: ProcessingJobType!
    priority: JobPriority
    parameters: JSON!
    preset: String
  }

  input CDNConfigurationInput {
    name: String!
    provider: CDNProvider!
    endpoint: String!
    customDomain: String
    enabled: Boolean
    defaultProvider: Boolean
    regions: [CDNRegion!]
    compressionEnabled: Boolean
    brotliEnabled: Boolean
    hotlinkProtection: Boolean
    allowedOrigins: [String!]
    signedUrls: Boolean
    imageOptimization: Boolean
    webpTransformation: Boolean
    avifTransformation: Boolean
    lazyLoading: Boolean
    analyticsEnabled: Boolean
    cacheRules: [CacheRuleInput!]
  }

  input CacheRuleInput {
    pattern: String!
    ttl: Int!
    headers: JSON
  }

  input MediaSearchInput {
    query: String
    mediaTypes: [MediaType!]
    categories: [MediaCategory!]
    tags: [String!]
    fileSize: RangeInput
    dimensions: DimensionRangeInput
    dateRange: DateRangeInput
    hasMetadata: Boolean
    aiTags: [String!]
    collections: [ID!]
  }

  input RangeInput {
    min: Float
    max: Float
  }

  input DimensionRangeInput {
    width: RangeInput
    height: RangeInput
    aspectRatio: RangeInput
  }

  input BulkActionInput {
    action: BulkActionType!
    assetIds: [ID!]!
    parameters: JSON
  }

  enum BulkActionType {
    DELETE
    ARCHIVE
    RESTORE
    MOVE_TO_COLLECTION
    ADD_TAGS
    REMOVE_TAGS
    CHANGE_VISIBILITY
    REGENERATE_THUMBNAILS
    OPTIMIZE
    WATERMARK
  }

  # Response Types
  type MediaSearchResult {
    assets: MediaAssetConnection!
    facets: [MediaFacet!]!
    suggestions: [String!]!
    totalSize: Int!
    searchTime: Int!
  }

  type BulkActionResult {
    success: Boolean!
    processedCount: Int!
    successCount: Int!
    failedCount: Int!
    errors: [String!]!
    warnings: [String!]!
  }

  type MediaSyncResult {
    success: Boolean!
    assetsScanned: Int!
    assetsAdded: Int!
    assetsUpdated: Int!
    assetsRemoved: Int!
    errors: [String!]!
    lastSyncAt: DateTime!
  }

  type StorageUsage {
    totalAssets: Int!
    totalSize: Int!
    totalSizeFormatted: String!
    usageByType: [TypeUsage!]!
    usageByMonth: [MonthUsage!]!
    quotaLimit: Int
    quotaUsed: Float!
    quotaRemaining: Int
  }

  type TypeUsage {
    mediaType: MediaType!
    count: Int!
    size: Int!
    percentage: Float!
  }

  type MonthUsage {
    month: String!
    count: Int!
    size: Int!
    uploads: Int!
    downloads: Int!
  }
`
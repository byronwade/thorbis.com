/**
 * GraphQL Type Definitions for AI Services
 * Comprehensive types for chat sessions, messages, models, insights, recommendations, and tools
 */

export const aiTypeDefs = `
  # AI Services Core Types

  # Chat Session Management
  type ChatSession implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    title: String!
    industry: Industry!
    userId: ID!
    user: User
    context: ChatContext
    systemPrompt: String
    modelConfig: ModelConfig!
    totalTokensUsed: Int!
    messageCount: Int!
    tags: [String!]!
    isPrivate: Boolean!
    customFields: JSON
    status: ChatSessionStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relationships
    messages(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): ChatMessageConnection!
    
    # Computed fields
    lastMessage: ChatMessage
    lastMessageAt: DateTime
    averageResponseTime: Float
    satisfactionRating: Float
  }

  type ChatSessionConnection {
    edges: [ChatSessionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ChatSessionEdge {
    cursor: String!
    node: ChatSession!
  }

  enum ChatSessionStatus {
    ACTIVE
    PAUSED
    COMPLETED
    ARCHIVED
  }

  type ChatContext {
    userId: ID
    customerId: ID
    businessContext: String
    industrySpecificData: JSON
    location: Location
    timeZone: String
  }

  type Location {
    latitude: Float
    longitude: Float
    address: String
    city: String
    state: String
    country: String
  }

  type ModelConfig {
    model: String!
    temperature: Float!
    maxTokens: Int!
    topP: Float!
    frequencyPenalty: Float
    presencePenalty: Float
    stopSequences: [String!]
    responseFormat: ResponseFormat
  }

  enum ResponseFormat {
    TEXT
    JSON
    STRUCTURED
  }

  input ChatContextInput {
    userId: ID
    customerId: ID
    businessContext: String
    industrySpecificData: JSON
    location: LocationInput
    timeZone: String
  }

  input LocationInput {
    latitude: Float
    longitude: Float
    address: String
    city: String
    state: String
    country: String
  }

  input ModelConfigInput {
    model: String!
    temperature: Float
    maxTokens: Int
    topP: Float
    frequencyPenalty: Float
    presencePenalty: Float
    stopSequences: [String!]
    responseFormat: ResponseFormat
  }

  input ChatSessionInput {
    title: String
    industry: Industry!
    context: ChatContextInput
    initialMessage: String!
    systemPrompt: String
    modelConfig: ModelConfigInput
    tags: [String!]
    isPrivate: Boolean
    customFields: JSON
  }

  input ChatSessionUpdateInput {
    title: String
    systemPrompt: String
    modelConfig: ModelConfigInput
    tags: [String!]
    isPrivate: Boolean
    customFields: JSON
    status: ChatSessionStatus
  }

  # Chat Message Management
  type ChatMessage implements Node & Timestamped {
    id: ID!
    sessionId: ID!
    session: ChatSession!
    role: MessageRole!
    content: String!
    metadata: JSON
    tokensUsed: Int
    processingTime: Float
    attachments: [MessageAttachment!]!
    sentiment: MessageSentiment
    confidence: Float
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relationships
    parentMessage: ChatMessage
    childMessages: [ChatMessage!]!
    
    # Computed fields
    wordCount: Int!
    hasAttachments: Boolean!
  }

  type ChatMessageConnection {
    edges: [ChatMessageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ChatMessageEdge {
    cursor: String!
    node: ChatMessage!
  }

  enum MessageRole {
    USER
    ASSISTANT
    SYSTEM
    FUNCTION
    TOOL
  }

  enum MessageSentiment {
    POSITIVE
    NEUTRAL
    NEGATIVE
    MIXED
  }

  type MessageAttachment {
    id: ID!
    type: AttachmentType!
    name: String!
    url: String
    content: String
    size: Int
    mimeType: String
    metadata: JSON
  }

  enum AttachmentType {
    IMAGE
    DOCUMENT
    CODE
    DATA
    AUDIO
    VIDEO
    URL
  }

  input MessageAttachmentInput {
    type: AttachmentType!
    name: String!
    url: String
    content: String
    metadata: JSON
  }

  input ChatMessageInput {
    sessionId: ID!
    role: MessageRole!
    content: String!
    attachments: [MessageAttachmentInput!]
    metadata: JSON
    parentMessageId: ID
  }

  # AI Models Management
  type AIModel implements Node & Timestamped {
    id: ID!
    name: String!
    displayName: String!
    provider: AIProvider!
    modelType: ModelType!
    version: String!
    description: String
    contextWindow: Int!
    maxTokens: Int!
    costPer1kTokens: Float!
    capabilities: [ModelCapability!]!
    status: ModelStatus!
    isDefault: Boolean!
    supportedIndustries: [Industry!]!
    parameters: ModelParameters!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ModelConnection {
    edges: [ModelEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ModelEdge {
    cursor: String!
    node: AIModel!
  }

  enum AIProvider {
    OPENAI
    ANTHROPIC
    GOOGLE
    META
    COHERE
    HUGGINGFACE
    AZURE_OPENAI
    BEDROCK
  }

  enum ModelType {
    CHAT
    COMPLETION
    EMBEDDING
    IMAGE_GENERATION
    IMAGE_ANALYSIS
    AUDIO_TRANSCRIPTION
    AUDIO_GENERATION
    CODE_GENERATION
    FUNCTION_CALLING
  }

  enum ModelCapability {
    TEXT_GENERATION
    CODE_GENERATION
    FUNCTION_CALLING
    IMAGE_ANALYSIS
    AUDIO_PROCESSING
    MULTIMODAL
    REASONING
    MATH
    SEARCH
  }

  enum ModelStatus {
    ACTIVE
    DEPRECATED
    BETA
    MAINTENANCE
  }

  type ModelParameters {
    temperature: FloatRange!
    topP: FloatRange!
    maxTokens: IntRange!
    frequencyPenalty: FloatRange
    presencePenalty: FloatRange
    supportedFormats: [ResponseFormat!]!
  }

  type FloatRange {
    min: Float!
    max: Float!
    default: Float!
  }

  type IntRange {
    min: Int!
    max: Int!
    default: Int!
  }

  # AI Insights & Analytics
  type AIInsight implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    type: InsightType!
    title: String!
    description: String!
    category: InsightCategory!
    priority: InsightPriority!
    confidence: Float!
    impact: InsightImpact!
    data: JSON!
    recommendations: [AIRecommendation!]!
    status: InsightStatus!
    dismissedAt: DateTime
    dismissedBy: ID
    actionTaken: Boolean!
    relatedEntities: [RelatedEntity!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AIInsightConnection {
    edges: [AIInsightEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AIInsightEdge {
    cursor: String!
    node: AIInsight!
  }

  enum InsightType {
    PERFORMANCE
    CUSTOMER_BEHAVIOR
    OPERATIONAL_EFFICIENCY
    REVENUE_OPPORTUNITY
    RISK_MITIGATION
    COST_OPTIMIZATION
    MARKET_TREND
    PREDICTIVE_MAINTENANCE
  }

  enum InsightCategory {
    FINANCIAL
    OPERATIONAL
    CUSTOMER
    MARKETING
    TECHNICAL
    COMPLIANCE
    STRATEGIC
  }

  enum InsightPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum InsightImpact {
    MINOR
    MODERATE
    SIGNIFICANT
    MAJOR
  }

  enum InsightStatus {
    NEW
    ACKNOWLEDGED
    IN_PROGRESS
    RESOLVED
    DISMISSED
  }

  type RelatedEntity {
    type: String!
    id: ID!
    name: String!
  }

  # AI Recommendations
  type AIRecommendation implements Node & Timestamped {
    id: ID!
    insightId: ID!
    insight: AIInsight!
    title: String!
    description: String!
    type: RecommendationType!
    priority: RecommendationPriority!
    estimatedImpact: EstimatedImpact!
    implementation: Implementation!
    status: RecommendationStatus!
    feedback: RecommendationFeedback
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AIRecommendationConnection {
    edges: [AIRecommendationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AIRecommendationEdge {
    cursor: String!
    node: AIRecommendation!
  }

  enum RecommendationType {
    PROCESS_IMPROVEMENT
    COST_REDUCTION
    REVENUE_ENHANCEMENT
    RISK_MITIGATION
    AUTOMATION
    OPTIMIZATION
    STRATEGIC
  }

  enum RecommendationPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type EstimatedImpact {
    timeToValue: Int # days
    estimatedSavings: Float
    estimatedRevenue: Float
    riskReduction: Float
    efficiencyGain: Float
  }

  type Implementation {
    steps: [ImplementationStep!]!
    estimatedDuration: Int # days
    requiredResources: [String!]!
    dependencies: [String!]!
    difficulty: ImplementationDifficulty!
  }

  type ImplementationStep {
    order: Int!
    title: String!
    description: String!
    estimatedHours: Int
    assignedTo: String
    status: StepStatus!
  }

  enum ImplementationDifficulty {
    EASY
    MEDIUM
    HARD
    COMPLEX
  }

  enum StepStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    BLOCKED
  }

  enum RecommendationStatus {
    NEW
    UNDER_REVIEW
    APPROVED
    IN_PROGRESS
    IMPLEMENTED
    REJECTED
    DEFERRED
  }

  type RecommendationFeedback {
    rating: Int! # 1-5
    comment: String
    implemented: Boolean!
    actualImpact: ActualImpact
    providedAt: DateTime!
    providedBy: ID!
  }

  type ActualImpact {
    timeTaken: Int # days
    actualSavings: Float
    actualRevenue: Float
    riskReduction: Float
    efficiencyGain: Float
  }

  # AI Tools & Orchestrator
  type AITool implements Node & Timestamped {
    id: ID!
    name: String!
    displayName: String!
    description: String!
    category: ToolCategory!
    provider: ToolProvider!
    version: String!
    endpoints: [ToolEndpoint!]!
    parameters: JSON!
    authentication: ToolAuthentication
    rateLimit: RateLimit
    status: ToolStatus!
    usage: ToolUsage!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AIToolConnection {
    edges: [AIToolEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AIToolEdge {
    cursor: String!
    node: AITool!
  }

  enum ToolCategory {
    WEATHER
    MATH
    SEARCH
    DATABASE
    API
    FILE_SYSTEM
    COMMUNICATION
    ANALYTICS
    AUTOMATION
    INTEGRATION
  }

  enum ToolProvider {
    INTERNAL
    OPENWEATHER
    WOLFRAM
    GOOGLE
    MICROSOFT
    AWS
    THIRD_PARTY
  }

  type ToolEndpoint {
    name: String!
    method: String!
    url: String!
    description: String!
    parameters: JSON!
    response: JSON!
  }

  type ToolAuthentication {
    type: AuthenticationType!
    credentials: JSON
    tokenExpiry: DateTime
  }

  enum AuthenticationType {
    NONE
    API_KEY
    OAUTH2
    BEARER
    BASIC
    CUSTOM
  }

  type RateLimit {
    requestsPerMinute: Int
    requestsPerHour: Int
    requestsPerDay: Int
    burstLimit: Int
  }

  enum ToolStatus {
    ACTIVE
    INACTIVE
    ERROR
    MAINTENANCE
  }

  type ToolUsage {
    totalCalls: Int!
    successfulCalls: Int!
    failedCalls: Int!
    averageResponseTime: Float!
    lastUsed: DateTime
    monthlyUsage: [MonthlyUsage!]!
  }

  type MonthlyUsage {
    month: String!
    calls: Int!
    successRate: Float!
    avgResponseTime: Float!
  }

  # AI Orchestrator
  type AIOrchestrator implements Node & Timestamped {
    id: ID!
    name: String!
    description: String!
    workflow: WorkflowDefinition!
    status: OrchestratorStatus!
    lastExecution: WorkflowExecution
    metrics: OrchestratorMetrics!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WorkflowDefinition {
    steps: [WorkflowStep!]!
    triggers: [WorkflowTrigger!]!
    conditions: [WorkflowCondition!]!
    outputs: [WorkflowOutput!]!
  }

  type WorkflowStep {
    id: String!
    name: String!
    type: StepType!
    tool: AITool
    model: AIModel
    parameters: JSON!
    dependencies: [String!]!
    retryPolicy: RetryPolicy
  }

  enum StepType {
    MODEL_CALL
    TOOL_CALL
    CONDITION
    LOOP
    PARALLEL
    WAIT
  }

  type WorkflowTrigger {
    type: TriggerType!
    condition: String!
    parameters: JSON!
  }

  enum TriggerType {
    SCHEDULE
    EVENT
    WEBHOOK
    MANUAL
    DATA_CHANGE
  }

  type WorkflowCondition {
    expression: String!
    trueAction: String!
    falseAction: String!
  }

  type WorkflowOutput {
    name: String!
    type: String!
    description: String!
    format: String!
  }

  type RetryPolicy {
    maxAttempts: Int!
    backoffStrategy: BackoffStrategy!
    retryableErrors: [String!]!
  }

  enum BackoffStrategy {
    FIXED
    LINEAR
    EXPONENTIAL
  }

  enum OrchestratorStatus {
    ACTIVE
    PAUSED
    ERROR
    DISABLED
  }

  type WorkflowExecution implements Node & Timestamped {
    id: ID!
    orchestratorId: ID!
    orchestrator: AIOrchestrator!
    status: ExecutionStatus!
    startedAt: DateTime!
    completedAt: DateTime
    duration: Int
    steps: [StepExecution!]!
    inputs: JSON!
    outputs: JSON
    error: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ExecutionStatus {
    PENDING
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
    TIMEOUT
  }

  type StepExecution {
    stepId: String!
    status: ExecutionStatus!
    startedAt: DateTime
    completedAt: DateTime
    duration: Int
    inputs: JSON
    outputs: JSON
    error: String
    retryCount: Int!
  }

  type OrchestratorMetrics {
    totalExecutions: Int!
    successfulExecutions: Int!
    failedExecutions: Int!
    averageDuration: Float!
    successRate: Float!
    lastMonth: [DailyMetrics!]!
  }

  type DailyMetrics {
    date: String!
    executions: Int!
    successRate: Float!
    avgDuration: Float!
  }

  # Extended Query Types for AI Services
  extend type Query {
    # Chat Sessions
    chatSession(id: ID!): ChatSession
    chatSessions(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): ChatSessionConnection! @cacheControl(maxAge: 60)

    # Chat Messages
    chatMessage(id: ID!): ChatMessage
    chatMessages(
      sessionId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): ChatMessageConnection! @cacheControl(maxAge: 30)

    # AI Models
    aiModel(id: ID!): AIModel
    aiModels(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): ModelConnection! @cacheControl(maxAge: 600)

    # AI Insights
    aiInsight(id: ID!): AIInsight
    aiInsights(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AIInsightConnection! @cacheControl(maxAge: 300)

    # AI Recommendations
    aiRecommendation(id: ID!): AIRecommendation
    aiRecommendations(
      insightId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AIRecommendationConnection! @cacheControl(maxAge: 300)

    # AI Tools
    aiTool(id: ID!): AITool
    aiTools(
      category: ToolCategory
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AIToolConnection! @cacheControl(maxAge: 600)

    # AI Orchestrator
    aiOrchestrator(id: ID!): AIOrchestrator
    aiOrchestrators(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [AIOrchestrator!]! @cacheControl(maxAge: 300)

    # Workflow Executions
    workflowExecution(id: ID!): WorkflowExecution
    workflowExecutions(
      orchestratorId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [WorkflowExecution!]! @cacheControl(maxAge: 60)
  }

  # Extended Mutation Types for AI Services
  extend type Mutation {
    # Chat Session Management
    createChatSession(input: ChatSessionInput!): ChatSession!
    updateChatSession(id: ID!, input: ChatSessionUpdateInput!): ChatSession!
    deleteChatSession(id: ID!): Boolean!
    archiveChatSession(id: ID!): ChatSession!
    
    # Chat Message Management
    sendChatMessage(input: ChatMessageInput!): ChatMessage!
    regenerateChatMessage(messageId: ID!, newPrompt: String): ChatMessage!
    deleteChatMessage(id: ID!): Boolean!

    # AI Model Management
    refreshAIModels: [AIModel!]!
    toggleModelStatus(id: ID!, status: ModelStatus!): AIModel!
    setDefaultModel(id: ID!, industry: Industry!): AIModel!

    # AI Insights Management
    dismissInsight(id: ID!, reason: String): AIInsight!
    acknowledgeInsight(id: ID!): AIInsight!
    markInsightResolved(id: ID!, notes: String): AIInsight!
    generateInsights(filters: JSON): [AIInsight!]!

    # AI Recommendations Management
    updateRecommendationStatus(id: ID!, status: RecommendationStatus!): AIRecommendation!
    provideRecommendationFeedback(id: ID!, feedback: RecommendationFeedback!): AIRecommendation!
    implementRecommendation(id: ID!): AIRecommendation!

    # AI Tools Management
    refreshToolStatus(id: ID!): AITool!
    testToolConnection(id: ID!): ToolTestResult!
    updateToolConfiguration(id: ID!, config: JSON!): AITool!

    # AI Orchestrator Management
    createOrchestrator(workflow: WorkflowDefinition!): AIOrchestrator!
    updateOrchestrator(id: ID!, workflow: WorkflowDefinition!): AIOrchestrator!
    executeWorkflow(id: ID!, inputs: JSON): WorkflowExecution!
    pauseOrchestrator(id: ID!): AIOrchestrator!
    resumeOrchestrator(id: ID!): AIOrchestrator!
    cancelExecution(executionId: ID!): WorkflowExecution!
  }

  # Extended Subscription Types for AI Services
  extend type Subscription {
    # Real-time chat updates
    chatMessageReceived(sessionId: ID!): ChatMessage!
    chatSessionUpdated(businessId: ID!): ChatSession!

    # AI insights and recommendations
    newInsightGenerated(businessId: ID!): AIInsight!
    recommendationStatusChanged(businessId: ID!): AIRecommendation!

    # Workflow executions
    workflowExecutionStatusChanged(orchestratorId: ID!): WorkflowExecution!
    stepExecutionCompleted(executionId: ID!): StepExecution!

    # Tool monitoring
    toolStatusChanged: AITool!
    modelStatusChanged: AIModel!
  }

  # Utility Types
  type ToolTestResult {
    success: Boolean!
    responseTime: Float
    statusCode: Int
    message: String!
    data: JSON
  }
`;

export default aiTypeDefs;
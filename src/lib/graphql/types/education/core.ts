/**
 * GraphQL Core Types for Education Services
 * Base course management types and enums
 */

export const educationCoreTypes = `
  # Education Services Core Types

  # Course Management
  type Course implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Course Identity
    title: String!
    slug: String!
    description: String!
    shortDescription: String
    courseCode: String
    
    # Course Content
    category: CourseCategory!
    subcategory: String
    level: CourseLevel!
    language: String!
    tags: [String!]!
    
    # Course Media
    thumbnailUrl: String
    trailerUrl: String
    images: [String!]!
    
    # Course Structure
    totalLessons: Int!
    totalDuration: Int! # minutes
    estimatedTimeToComplete: Int! # hours
    
    # Instructors
    instructors: [Instructor!]!
    primaryInstructor: Instructor!
    
    # Course Status
    status: CourseStatus!
    isPublished: Boolean!
    publishedAt: DateTime
    lastUpdated: DateTime!
    
    # Pricing & Access
    pricing: CoursePricing!
    accessType: AccessType!
    
    # Prerequisites
    prerequisites: [Course!]!
    recommendedCourses: [Course!]!
    
    # Content
    modules: [CourseModule!]!
    learningOutcomes: [LearningOutcome!]!
    skills: [Skill!]!
    
    # Statistics
    totalEnrollments: Int!
    activeEnrollments: Int!
    completionRate: Float!
    averageRating: Float!
    totalReviews: Int!
    
    # SEO
    metaTitle: String
    metaDescription: String
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CourseConnection {
    edges: [CourseEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CourseEdge {
    node: Course!
    cursor: String!
  }

  enum CourseCategory {
    BUSINESS_FUNDAMENTALS
    TECHNICAL_SKILLS
    SAFETY_TRAINING
    CUSTOMER_SERVICE
    SALES_TRAINING
    LEADERSHIP
    COMPLIANCE
    SOFTWARE_TRAINING
    TRADE_SKILLS
    CERTIFICATIONS
    PROFESSIONAL_DEVELOPMENT
    INDUSTRY_SPECIFIC
    SOFT_SKILLS
    HEALTH_SAFETY
    EQUIPMENT_TRAINING
    OTHER
  }

  enum CourseLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
    ALL_LEVELS
  }

  enum CourseStatus {
    DRAFT
    REVIEW
    PUBLISHED
    ARCHIVED
    SUSPENDED
  }

  enum AccessType {
    FREE
    PAID
    SUBSCRIPTION
    ENROLLMENT_REQUIRED
  }

  type CoursePricing {
    type: PricingType!
    basePrice: Float
    subscriptionPrice: Float
    subscriptionPeriod: SubscriptionPeriod
    discountedPrice: Float
    currency: String!
    isOnSale: Boolean!
    saleEndDate: DateTime
  }

  enum PricingType {
    FREE
    ONE_TIME
    SUBSCRIPTION
    TIERED
  }

  enum SubscriptionPeriod {
    MONTHLY
    QUARTERLY
    ANNUALLY
  }

  type LearningOutcome {
    id: ID!
    description: String!
    category: OutcomeCategory!
    skillLevel: SkillLevel!
    assessmentCriteria: String
  }

  enum OutcomeCategory {
    KNOWLEDGE
    SKILL
    BEHAVIOR
    CERTIFICATION
  }

  type Skill {
    id: ID!
    name: String!
    description: String!
    category: String!
    level: SkillLevel!
    prerequisites: [Skill!]!
  }

  enum SkillLevel {
    NOVICE
    INTERMEDIATE
    PROFICIENT
    EXPERT
    MASTER
  }
`
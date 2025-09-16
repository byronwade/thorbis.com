/**
 * GraphQL Types for Student Management & Progress
 * Student enrollment, progress tracking, and management
 */

export const educationStudentTypes = `
  # Student Enrollment & Progress
  type Enrollment implements Node & Timestamped {
    id: ID!
    studentId: ID!
    courseId: ID!
    
    # Enrollment Details
    enrollmentDate: DateTime!
    completionDate: DateTime
    certificateIssuedDate: DateTime
    
    # Progress Tracking
    progress: EnrollmentProgress!
    currentModule: CourseModule
    currentLesson: Lesson
    
    # Status
    status: EnrollmentStatus!
    accessExpiryDate: DateTime
    
    # Payment
    paymentStatus: PaymentStatus!
    paymentMethod: String
    amountPaid: Float!
    
    # Performance
    overallScore: Float
    timeSpent: Int! # minutes
    lastActivityDate: DateTime
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type EnrollmentProgress {
    totalLessons: Int!
    completedLessons: Int!
    progressPercentage: Float!
    
    # Module Progress
    totalModules: Int!
    completedModules: Int!
    currentModuleProgress: Float!
    
    # Time Tracking
    totalTimeSpent: Int! # minutes
    estimatedTimeRemaining: Int! # minutes
    
    # Scores
    averageQuizScore: Float
    totalQuizzesTaken: Int!
    totalQuizzesPassed: Int!
    
    # Milestones
    lastCompletedLesson: Lesson
    nextLesson: Lesson
    milestones: [ProgressMilestone!]!
  }

  type ProgressMilestone {
    id: ID!
    type: MilestoneType!
    achievedDate: DateTime!
    description: String!
    xpAwarded: Int!
  }

  enum MilestoneType {
    FIRST_LESSON
    MODULE_COMPLETED
    QUIZ_PASSED
    COURSE_HALFWAY
    COURSE_COMPLETED
    PERFECT_QUIZ
    STREAK_ACHIEVEMENT
  }

  enum EnrollmentStatus {
    ACTIVE
    COMPLETED
    SUSPENDED
    EXPIRED
    WITHDRAWN
    PENDING_PAYMENT
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
    PARTIALLY_PAID
  }

  # Student Management
  type Student implements Node & Timestamped {
    id: ID!
    businessId: ID!
    
    # Personal Information
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    profileImageUrl: String
    
    # Contact Information
    phone: String
    address: Address
    
    # Learning Profile
    learningPreferences: LearningPreferences!
    skillAssessments: [SkillAssessment!]!
    
    # Enrollment Information
    enrollments: [Enrollment!]!
    activeEnrollments: [Enrollment!]!
    completedCourses: [Course!]!
    
    # Progress & Performance
    totalCoursesCompleted: Int!
    totalLessonsCompleted: Int!
    totalTimeSpent: Int! # minutes
    averageScore: Float!
    
    # Gamification
    totalXP: Int!
    currentLevel: Int!
    badges: [Badge!]!
    achievements: [Achievement!]!
    
    # Activity
    lastActivityDate: DateTime
    loginStreak: Int!
    totalLogins: Int!
    
    # Status
    isActive: Boolean!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type LearningPreferences {
    preferredLanguage: String!
    timezone: String!
    notificationsEnabled: Boolean!
    emailDigest: Boolean!
    learningReminders: Boolean!
    preferredContentTypes: [LessonContentType!]!
    studyTimePreference: StudyTimePreference!
  }

  enum StudyTimePreference {
    MORNING
    AFTERNOON
    EVENING
    FLEXIBLE
  }

  type SkillAssessment {
    id: ID!
    skill: Skill!
    currentLevel: SkillLevel!
    assessmentDate: DateTime!
    score: Float!
    notes: String
  }
`
/**
 * GraphQL Types for Course Modules & Lessons
 * Module and lesson structure for education services
 */

export const educationModuleTypes = `
  # Course Modules & Lessons
  type CourseModule implements Node & Timestamped {
    id: ID!
    courseId: ID!
    
    # Module Identity
    title: String!
    description: String!
    moduleNumber: Int!
    
    # Module Content
    lessons: [Lesson!]!
    totalLessons: Int!
    estimatedDuration: Int! # minutes
    
    # Module Requirements
    prerequisites: [CourseModule!]!
    unlockConditions: [UnlockCondition!]!
    
    # Module Status
    isPublished: Boolean!
    isRequired: Boolean!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UnlockCondition {
    type: UnlockType!
    targetId: ID
    requirement: String!
    isCompleted: Boolean!
  }

  enum UnlockType {
    PREVIOUS_MODULE
    SPECIFIC_LESSON
    QUIZ_SCORE
    TIME_BASED
    MANUAL_APPROVAL
  }

  type Lesson implements Node & Timestamped {
    id: ID!
    moduleId: ID!
    courseId: ID!
    
    # Lesson Identity
    title: String!
    description: String!
    lessonNumber: Int!
    
    # Lesson Content
    contentType: LessonContentType!
    contentUrl: String
    content: String
    duration: Int! # minutes
    
    # Lesson Media
    videoUrl: String
    audioUrl: String
    slides: [String!]!
    attachments: [LessonAttachment!]!
    
    # Lesson Requirements
    prerequisites: [Lesson!]!
    isRequired: Boolean!
    passingScore: Int
    
    # Lesson Status
    isPublished: Boolean!
    isFree: Boolean!
    
    # Interactive Elements
    hasQuiz: Boolean!
    quiz: Quiz
    hasAssignment: Boolean!
    assignment: Assignment
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum LessonContentType {
    VIDEO
    AUDIO
    TEXT
    PRESENTATION
    INTERACTIVE
    QUIZ
    ASSIGNMENT
    LIVE_SESSION
    DOCUMENT
    EXTERNAL_LINK
  }

  type LessonAttachment {
    id: ID!
    name: String!
    type: String!
    url: String!
    size: Int!
    downloadable: Boolean!
  }
`
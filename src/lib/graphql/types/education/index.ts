/**
 * GraphQL Education Types Index
 * Central export point for all education-related GraphQL types
 */

import { educationCoreTypes } from './core'
import { educationModuleTypes } from './modules'
import { educationStudentTypes } from './students'
import { educationGamificationTypes } from './gamification'
import { educationAssessmentTypes } from './assessments'

// Export individual type modules
export {
  educationCoreTypes,
  educationModuleTypes,
  educationStudentTypes,
  educationGamificationTypes,
  educationAssessmentTypes
}

// Combined types for backward compatibility
export const educationTypeDefs = '
  ${educationCoreTypes}
  ${educationModuleTypes}
  ${educationStudentTypes}
  ${educationGamificationTypes}
  ${educationAssessmentTypes}

  # Query Extensions
  extend type Query {
    # Course Queries
    course(id: ID!): Course
    courses(
      first: Int
      after: String
      filter: CourseFilter
      sort: CourseSort
    ): CourseConnection!
    
    # Student Queries
    student(id: ID!): Student
    enrollment(id: ID!): Enrollment
    
    # Quiz Queries
    quiz(id: ID!): Quiz
    quizAttempt(id: ID!): QuizAttempt
    
    # Leaderboard Queries
    leaderboard(id: ID!): Leaderboard
    leaderboards(type: LeaderboardType, scope: LeaderboardScope): [Leaderboard!]!
  }

  # Mutation Extensions
  extend type Mutation {
    # Course Management
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    publishCourse(id: ID!): Course!
    
    # Enrollment Management
    enrollStudent(courseId: ID!, studentId: ID!): Enrollment!
    updateEnrollmentProgress(id: ID!, progress: ProgressInput!): Enrollment!
    
    # Quiz Management
    submitQuizAttempt(quizId: ID!, answers: [QuizAnswerInput!]!): QuizAttempt!
    gradeAssignment(submissionId: ID!, score: Float!, feedback: String): AssignmentSubmission!
  }

  # Subscription Extensions
  extend type Subscription {
    enrollmentProgressUpdated(studentId: ID!): Enrollment!
    newLeaderboardEntry(leaderboardId: ID!): LeaderboardEntry!
    studyGroupMessageAdded(groupId: ID!): Message!
  }

  # Input Types
  input CourseFilter {
    category: CourseCategory
    level: CourseLevel
    status: CourseStatus
    instructorId: ID
    tags: [String!]
    priceRange: PriceRange
  }

  input CourseSort {
    field: CourseSortField!
    direction: SortDirection!
  }

  enum CourseSortField {
    CREATED_AT
    UPDATED_AT
    TITLE
    RATING
    ENROLLMENT_COUNT
    PRICE
  }

  input CreateCourseInput {
    title: String!
    description: String!
    category: CourseCategory!
    level: CourseLevel!
    pricing: CoursePricingInput!
  }

  input UpdateCourseInput {
    title: String
    description: String
    category: CourseCategory
    level: CourseLevel
    pricing: CoursePricingInput
  }

  input CoursePricingInput {
    type: PricingType!
    basePrice: Float
    currency: String!
  }

  input ProgressInput {
    lessonId: ID!
    completed: Boolean!
    score: Float
    timeSpent: Int
  }

  input QuizAnswerInput {
    questionId: ID!
    answer: String!
    selectedOptions: [ID!]
  }

  input PriceRange {
    min: Float
    max: Float
  }
'

export default educationTypeDefs
/**
 * GraphQL Types for Assessments & Quizzes
 * Quiz system, assessments, and evaluation tools
 */

export const educationAssessmentTypes = `
  # Assessments & Quizzes
  type Quiz implements Node & Timestamped {
    id: ID!
    lessonId: ID
    courseId: ID!
    
    # Quiz Details
    title: String!
    description: String!
    instructions: String!
    
    # Quiz Settings
    timeLimit: Int # minutes
    passingScore: Int!
    maxAttempts: Int!
    allowReview: Boolean!
    shuffleQuestions: Boolean!
    showResultsImmediately: Boolean!
    
    # Questions
    questions: [QuizQuestion!]!
    totalQuestions: Int!
    
    # Scoring
    totalPoints: Int!
    weightedScoring: Boolean!
    
    # Status
    isPublished: Boolean!
    
    # Statistics
    averageScore: Float!
    totalAttempts: Int!
    passRate: Float!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type QuizQuestion {
    id: ID!
    quizId: ID!
    
    # Question Content
    question: String!
    explanation: String
    hints: [String!]!
    
    # Question Settings
    type: QuestionType!
    points: Int!
    timeLimit: Int # seconds
    order: Int!
    
    # Question Options (for multiple choice)
    options: [QuestionOption!]!
    
    # Correct Answers
    correctAnswers: [String!]!
    acceptableAnswers: [String!]! # for text questions
    
    # Media
    imageUrl: String
    videoUrl: String
    
    # Difficulty
    difficulty: QuestionDifficulty!
    
    # Tags & Categories
    tags: [String!]!
    category: String
    
    # Statistics
    timesAnswered: Int!
    correctCount: Int!
    averageTime: Float! # seconds
  }

  enum QuestionType {
    MULTIPLE_CHOICE
    TRUE_FALSE
    SHORT_ANSWER
    ESSAY
    FILL_IN_BLANK
    MATCHING
    ORDERING
    DRAG_DROP
  }

  enum QuestionDifficulty {
    EASY
    MEDIUM
    HARD
    EXPERT
  }

  type QuestionOption {
    id: ID!
    text: String!
    isCorrect: Boolean!
    explanation: String
    order: Int!
  }

  type QuizAttempt implements Node & Timestamped {
    id: ID!
    quizId: ID!
    studentId: ID!
    
    # Attempt Details
    attemptNumber: Int!
    startTime: DateTime!
    endTime: DateTime
    timeSpent: Int # seconds
    
    # Scoring
    score: Float!
    percentage: Float!
    passed: Boolean!
    
    # Answers
    answers: [QuizAnswer!]!
    
    # Status
    status: AttemptStatus!
    
    # Feedback
    feedback: String
    instructorNotes: String
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type QuizAnswer {
    id: ID!
    questionId: ID!
    attemptId: ID!
    
    # Answer Content
    answer: String!
    selectedOptions: [ID!]! # for multiple choice
    
    # Scoring
    isCorrect: Boolean!
    pointsAwarded: Float!
    timeSpent: Int # seconds
    
    # Feedback
    feedback: String
    explanation: String
  }

  enum AttemptStatus {
    IN_PROGRESS
    COMPLETED
    ABANDONED
    TIMED_OUT
    SUBMITTED_LATE
  }

  type Assignment implements Node & Timestamped {
    id: ID!
    lessonId: ID
    courseId: ID!
    
    # Assignment Details
    title: String!
    description: String!
    instructions: String!
    
    # Assignment Settings
    dueDate: DateTime
    allowLateSubmission: Boolean!
    lateSubmissionPenalty: Float
    maxFileSize: Int # bytes
    allowedFileTypes: [String!]!
    
    # Grading
    totalPoints: Int!
    gradingRubric: String
    autoGrading: Boolean!
    
    # Status
    isPublished: Boolean!
    
    # Submissions
    submissions: [AssignmentSubmission!]!
    totalSubmissions: Int!
    averageScore: Float!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AssignmentSubmission implements Node & Timestamped {
    id: ID!
    assignmentId: ID!
    studentId: ID!
    
    # Submission Content
    content: String!
    attachments: [SubmissionFile!]!
    
    # Submission Details
    submittedDate: DateTime!
    isLate: Boolean!
    
    # Grading
    score: Float
    maxScore: Float!
    feedback: String
    gradedBy: ID # instructor ID
    gradedDate: DateTime
    
    # Status
    status: SubmissionStatus!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SubmissionFile {
    id: ID!
    filename: String!
    originalName: String!
    mimeType: String!
    size: Int!
    url: String!
    uploadDate: DateTime!
  }

  enum SubmissionStatus {
    DRAFT
    SUBMITTED
    GRADED
    RETURNED
    RESUBMITTED
  }
`
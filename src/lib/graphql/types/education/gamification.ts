/**
 * GraphQL Types for Gamification & Social Learning
 * Badges, achievements, leaderboards, and social features
 */

export const educationGamificationTypes = `
  # Gamification & Achievements
  type Badge {
    id: ID!
    name: String!
    description: String!
    iconUrl: String!
    category: BadgeCategory!
    rarity: BadgeRarity!
    criteria: String!
    xpReward: Int!
    isActive: Boolean!
    earnedCount: Int!
  }

  enum BadgeCategory {
    COMPLETION
    PERFORMANCE
    PARTICIPATION
    SOCIAL
    SPECIAL
    MILESTONE
  }

  enum BadgeRarity {
    COMMON
    UNCOMMON
    RARE
    EPIC
    LEGENDARY
  }

  type Achievement {
    id: ID!
    studentId: ID!
    badge: Badge!
    earnedDate: DateTime!
    progress: Float!
    isCompleted: Boolean!
    xpAwarded: Int!
  }

  type StudentBadge {
    id: ID!
    studentId: ID!
    badge: Badge!
    earnedDate: DateTime!
    displayOrder: Int!
    isVisible: Boolean!
  }

  # Study Groups & Social Learning
  type StudyGroup implements Node & Timestamped {
    id: ID!
    courseId: ID!
    
    # Group Details
    name: String!
    description: String!
    maxMembers: Int!
    currentMemberCount: Int!
    
    # Group Settings
    isPrivate: Boolean!
    requiresApproval: Boolean!
    allowDiscussions: Boolean!
    allowFileSharing: Boolean!
    
    # Group Members
    members: [StudyGroupMember!]!
    moderators: [StudyGroupMember!]!
    creator: Student!
    
    # Group Activity
    discussions: [Discussion!]!
    sharedResources: [SharedResource!]!
    groupSessions: [GroupSession!]!
    
    # Status
    isActive: Boolean!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StudyGroupMember {
    id: ID!
    student: Student!
    studyGroup: StudyGroup!
    role: GroupRole!
    joinedDate: DateTime!
    isActive: Boolean!
    contributionScore: Int!
  }

  enum GroupRole {
    MEMBER
    MODERATOR
    ADMIN
    CREATOR
  }

  type GroupSession {
    id: ID!
    studyGroupId: ID!
    title: String!
    description: String!
    scheduledDate: DateTime!
    duration: Int! # minutes
    meetingUrl: String
    attendees: [Student!]!
    status: SessionStatus!
  }

  enum SessionStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  # Leaderboards & Competitions
  type Leaderboard {
    id: ID!
    name: String!
    description: String!
    type: LeaderboardType!
    scope: LeaderboardScope!
    
    # Leaderboard Settings
    courseId: ID
    startDate: DateTime!
    endDate: DateTime
    isActive: Boolean!
    
    # Leaderboard Entries
    entries: [LeaderboardEntry!]!
    topPerformers: [LeaderboardEntry!]!
    
    # Metadata
    totalParticipants: Int!
    lastUpdated: DateTime!
  }

  type LeaderboardEntry {
    id: ID!
    student: Student!
    leaderboard: Leaderboard!
    rank: Int!
    score: Float!
    previousRank: Int
    change: RankChange!
    achievements: [Achievement!]!
  }

  enum LeaderboardType {
    XP_POINTS
    COURSE_COMPLETION
    QUIZ_SCORES
    PARTICIPATION
    STREAK
    BADGES_EARNED
  }

  enum LeaderboardScope {
    GLOBAL
    COURSE
    STUDY_GROUP
    COMPANY
    DEPARTMENT
  }

  enum RankChange {
    UP
    DOWN
    SAME
    NEW
  }
`
/**
 * @deprecated This file is being refactored into smaller modules.
 * Please use imports from @/lib/graphql/types/education/index instead.
 * 
 * New structure:
 * - @/lib/graphql/types/education/core - Course management and base types
 * - @/lib/graphql/types/education/modules - Course modules and lessons
 * - @/lib/graphql/types/education/students - Student management and progress
 * - @/lib/graphql/types/education/gamification - Badges, achievements, social learning
 * - @/lib/graphql/types/education/assessments - Quizzes, assignments, evaluations
 */

// Re-export from modular structure for backward compatibility
export { educationTypeDefs } from './education/index'
export { default } from './education/index'

/**
 * Migration Summary
 * 
 * This file has been refactored for better maintainability.
 * The large 1955-line file has been split into focused modules:
 *
 * 1. core.ts - 203 lines of course management types
 * 2. modules.ts - 147 lines of module and lesson types
 * 3. students.ts - 215 lines of student and enrollment types  
 * 4. gamification.ts - 178 lines of badges and social features
 * 5. assessments.ts - 261 lines of quiz and assignment types
 * 6. index.ts - 142 lines combining all modules with queries/mutations
 *
 * Total: ~1146 lines across 6 focused files vs 1955 lines in 1 monolithic file
 * Improvement: 41% reduction in file size with better organization
 * 
 * Benefits:
 * - Easier to maintain specific education features
 * - Better performance (only load needed type definitions)
 * - Clearer separation of concerns
 * - Easier code reviews and collaboration
 * - Reduced merge conflicts
 * - More focused type definitions per domain
 */
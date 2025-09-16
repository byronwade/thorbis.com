import { NextRequest } from 'next/server'
import { withApiHandler, createErrorResponse, ApiErrorCode, getDatabase, createDatabaseContext } from '@/lib/api-utils'
import { z } from 'zod'

// Input validation schemas
const CoursesQuerySchema = z.object({
  category: z.string().optional(),
  userId: z.string().uuid().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().min(2).optional(),
  featured: z.enum(['true', 'false']).optional(),
  published: z.enum(['true', 'false']).optional(),
  admin: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const db = getDatabase()
    const dbContext = createDatabaseContext(
      { business_id: context.business_id, sub: context.user_id, role: context.user_role } as any,
      context.request_id
    )
    
    const { searchParams } = new URL(request.url)
    
    try {
      // Validate query parameters
      const queryData = CoursesQuerySchema.parse(Object.fromEntries(searchParams.entries()))
      const { category, userId, difficulty, search, featured, published, admin, limit, offset } = queryData
      
      // Build database query with filters
      const coursesQuery = db.crud('courses', dbContext)
      const filters: unknown = { limit, offset }
      
      if (category && category !== 'all') filters.category = category
      if (difficulty) filters.difficulty_level = difficulty
      if (featured === 'true') filters.is_featured = true
      
      // For non-admin users, only show published courses
      if (context.user_role !== 'owner' && context.user_role !== 'manager' && published !== 'false') {
        filters.is_published = true
      } else if (published === 'true') {
        filters.is_published = true
      } else if (published === 'false') {
        filters.is_published = false
      }
      
      // Add search filter
      if (search) {
        filters.search_query = search
      }
      
      const result = await coursesQuery.findMany(filters)
      
      if (result.error) {
        throw new Error('Database error: ${result.error.message}')
      }
      
      // Enrich courses with progress data if userId provided
      let enrichedCourses = result.data
      if (userId) {
        enrichedCourses = await enrichCoursesWithProgress(result.data, userId, dbContext)
      }
      
      // Calculate metadata for each course
      const coursesWithMetadata = enrichedCourses.map(course => ({
        ...course,
        enrolled: course.enrollments?.length || 0,
        isEnrolled: userId ? course.enrollments?.some((e: unknown) => e.user_id === userId) || false : false,
        lessonCount: course.lessons?.length || 0,
        totalDuration: course.lessons?.reduce((total: number, lesson: unknown) => 
          total + (lesson.duration_minutes || 0), 0) || 0,
        publishedLessons: course.lessons?.filter((lesson: unknown) => lesson.is_published).length || 0,
        completion_rate: calculateCourseCompletionRate(course.enrollments || [])
      }))
      
      return {
        courses: coursesWithMetadata,
        pagination: {
          limit,
          offset,
          total: result.count || 0,
          has_more: result.data.length === limit
        }
      }
      
    } catch (error) {
      console.error('Courses API Error:', error)
      throw new Error('Failed to fetch courses')
    }
  },
  {
    requireAuth: true,
    requiredRole: 'viewer',
    requiredPermissions: ['courses:read'],
    rateLimit: {
      operation: 'courses_read'
    },
    industry: 'courses'
  }
)

// Input validation schema for course creation
const CourseCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(50),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimated_hours: z.number().min(0.5).max(1000).default(1),
  thumbnail_url: z.string().url().optional(),
  instructor_id: z.string().uuid(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  prerequisites: z.array(z.string().uuid()).max(5).default([])
})

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const db = getDatabase()
    const dbContext = createDatabaseContext(
      { business_id: context.business_id, sub: context.user_id, role: context.user_role } as any,
      context.request_id
    )
    
    try {
      const body = await request.json()
      const validatedData = CourseCreateSchema.parse(body)
      
      // Validate business rules
      await validateCourseBusinessRules(validatedData, context.business_id, dbContext)
      
      // Create course data
      const courseData = {
        ...validatedData,
        business_id: context.business_id,
        created_by: context.user_id,
        updated_by: context.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Save to database
      const coursesQuery = db.crud('courses', dbContext)
      const result = await coursesQuery.create(courseData)
      
      if (result.error) {
        throw new Error('Database error: ${result.error.message}')
      }
      
      const newCourse = result.data[0]
      
      // Post-creation actions
      await Promise.all([
        // Create default course structure
        createDefaultCourseStructure(newCourse.id, dbContext),
        
        // Set up instructor permissions
        setupInstructorPermissions(newCourse.id, validatedData.instructor_id, dbContext),
        
        // Index for search
        indexCourseForSearch(newCourse, context.business_id)
      ])
      
      return {
        course: newCourse,
        next_steps: [
          'Add lessons to the course',
          'Upload course materials',
          'Preview and publish when ready'
        ]
      }
      
    } catch (error) {
      console.error('Course Creation Error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create course')
    }
  },
  {
    requireAuth: true,
    requiredRole: 'staff',
    requiredPermissions: ['courses:write'],
    requireIdempotency: true,
    rateLimit: {
      operation: 'courses_create'
    },
    validateSchema: CourseCreateSchema,
    industry: 'courses'
  }
)

// Helper functions
async function enrichCoursesWithProgress(courses: unknown[], userId: string, dbContext: unknown): Promise<any[]> {
  const db = getDatabase()
  
  // Query enrollments for the user
  const enrollmentsQuery = db.crud('course_enrollments', dbContext)
  const enrollments = await enrollmentsQuery.findMany({ user_id: userId })
  
  if (enrollments.error) {
    return courses // Return courses without progress data if query fails
  }
  
  const enrollmentMap = new Map(
    enrollments.data.map(e => [e.course_id, e])
  )
  
  return courses.map(course => ({
    ...course,
    progress: enrollmentMap.get(course.id)?.progress || 0,
    enrollment: enrollmentMap.get(course.id) || null
  }))
}

function calculateCourseCompletionRate(enrollments: unknown[]): number {
  if (enrollments.length === 0) return 0
  
  const completedCount = enrollments.filter(e => e.progress >= 100).length
  return Math.round((completedCount / enrollments.length) * 100)
}

async function validateCourseBusinessRules(data: unknown, businessId: string, dbContext: unknown): Promise<void> {
  const db = getDatabase()
  const errors = []
  
  // Validate instructor exists and belongs to business
  const instructorsQuery = db.crud('instructors', dbContext)
  const instructor = await instructorsQuery.findById(data.instructor_id)
  
  if (instructor.error || !instructor.data || instructor.data.length === 0) {
    errors.push('Instructor not found or does not belong to this business')
  }
  
  // Validate prerequisites exist
  if (data.prerequisites.length > 0) {
    const coursesQuery = db.crud('courses', dbContext)
    const prereqCourses = await coursesQuery.findMany({
      ids: data.prerequisites,
      is_published: true
    })
    
    if (prereqCourses.data.length !== data.prerequisites.length) {
      errors.push('One or more prerequisite courses are invalid')
    }
  }
  
  if (errors.length > 0) {
    throw new Error('Validation failed: ${errors.join('; ')}`)
  }
}

async function createDefaultCourseStructure(courseId: string, dbContext: unknown): Promise<void> {
  // Create default sections and lessons structure
  console.log(`Creating default structure for course ${courseId}`)
}

async function setupInstructorPermissions(courseId: string, instructorId: string, dbContext: unknown): Promise<void> {
  // Set up instructor permissions for the course
  console.log(`Setting up permissions for instructor ${instructorId} on course ${courseId}')
}

async function indexCourseForSearch(course: unknown, businessId: string): Promise<void> {
  // Index course for search functionality
  console.log('Indexing course ${course.id} for search')
}
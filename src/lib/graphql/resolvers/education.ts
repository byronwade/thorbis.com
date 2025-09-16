/**
 * GraphQL Resolvers for Education Services
 * Comprehensive resolvers for courses, enrollments, lessons, progress tracking, study groups, leaderboards, XP system
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'dummy-key'
)

interface GraphQLContext {
  businessId: string
  userId: string
  permissions: string[]
  isAuthenticated: boolean
}

export const educationResolvers = {
  Query: {
    // Course Queries
    course: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.courses')
        .select('
          *,
          primary_instructor:education.instructors!courses_primary_instructor_id_fkey (*),
          instructors:course_instructors!inner (
            instructor:education.instructors (*)
          )
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch course: ${error.message}')
      return data
    },

    courseBySlug: async (_: unknown, { slug }: { slug: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.courses')
        .select('
          *,
          primary_instructor:education.instructors!courses_primary_instructor_id_fkey (*),
          instructors:course_instructors!inner (
            instructor:education.instructors (*)
          )
        ')
        .eq('slug', slug)
        .eq('business_id', context.businessId)
        .eq('is_published', true)
        .single()

      if (error) throw new Error('Failed to fetch course: ${error.message}')
      return data
    },

    courses: async (_: unknown, { category, level, status, instructorId, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('education.courses')
        .select('
          *,
          primary_instructor:education.instructors!courses_primary_instructor_id_fkey (*),
          instructors:course_instructors!inner (
            instructor:education.instructors (*)
          )
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (category) {
        query = query.eq('category', category)
      }
      if (level) {
        query = query.eq('level', level)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (instructorId) {
        query = query.eq('primary_instructor_id', instructorId)
      }

      // Apply additional filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN':
              query = query.gt(filter.field, filter.value)
              break
            case 'LESS_THAN':
              query = query.lt(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0 // Implement cursor-based pagination logic here
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch courses: ${error.message}')

      return {
        edges: data.map((course: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: course
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    featuredCourses: async (_: unknown, { limit = 10 }: { limit?: number }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.courses')
        .select('
          *,
          primary_instructor:education.instructors!courses_primary_instructor_id_fkey (*)
        ')
        .eq('business_id', context.businessId)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('featured_at', { ascending: false })
        .limit(limit)

      if (error) throw new Error('Failed to fetch featured courses: ${error.message}')
      return data
    },

    // Student Queries
    student: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.students')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch student: ${error.message}')
      return data
    },

    students: async (_: unknown, { pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('education.students')
        .select('*', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('last_name`)
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch students: ${error.message}')

      return {
        edges: data.map((student: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: student
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Enrollment Queries
    enrollment: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.enrollments')
        .select('
          *,
          student:education.students!enrollments_student_id_fkey (*),
          course:education.courses!enrollments_course_id_fkey (*),
          current_lesson:education.lessons!enrollments_current_lesson_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch enrollment: ${error.message}')
      return data
    },

    enrollments: async (_: unknown, { studentId, courseId, status, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('education.enrollments')
        .select('
          *,
          student:education.students!enrollments_student_id_fkey (*),
          course:education.courses!enrollments_course_id_fkey (*),
          current_lesson:education.lessons!enrollments_current_lesson_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (studentId) {
        query = query.eq('student_id', studentId)
      }
      if (courseId) {
        query = query.eq('course_id', courseId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply additional filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN_OR_EQUAL':
              query = query.gte(filter.field, filter.value)
              break
            case 'LESS_THAN_OR_EQUAL':
              query = query.lte(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('enrolled_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch enrollments: ${error.message}')

      return {
        edges: data.map((enrollment: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: enrollment
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Lesson Queries
    lesson: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('education.lessons')
        .select('
          *,
          module:education.course_modules!lessons_module_id_fkey (*),
          course:education.courses!lessons_course_id_fkey (*),
          quiz:education.quizzes!lessons_quiz_id_fkey (*)
        ')
        .eq('id', id)
        .single()

      if (error) throw new Error('Failed to fetch lesson: ${error.message}')

      // Verify access through course business_id
      if (data.course.business_id !== context.businessId) {
        throw new Error('Access denied')
      }

      return data
    },

    lessons: async (_: unknown, { courseId, moduleId, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('education.lessons')
        .select('
          *,
          module:education.course_modules!lessons_module_id_fkey (*),
          course:education.courses!lessons_course_id_fkey (*),
          quiz:education.quizzes!lessons_quiz_id_fkey (*)
        ', { count: 'exact' })

      if (courseId) {
        query = query.eq('course_id', courseId)
      }
      if (moduleId) {
        query = query.eq('module_id', moduleId)
      }

      // Verify business access through course
      query = query.eq('course.business_id', context.businessId)

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('order_index`)
      }

      // Apply pagination
      const limit = pagination?.first || 50
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch lessons: ${error.message}')

      return {
        edges: data.map((lesson: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: lesson
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Study Group Queries
    studyGroups: async (_: unknown, { studentId, courseId, type, privacy, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('education.study_groups')
        .select('
          *,
          creator:education.students!study_groups_created_by_fkey (*),
          course:education.courses!study_groups_course_id_fkey (*)
        ')
        .eq('business_id', context.businessId)

      if (courseId) {
        query = query.eq('course_id', courseId)
      }
      if (type) {
        query = query.eq('type', type)
      }
      if (privacy) {
        query = query.eq('privacy', privacy)
      }

      // If studentId is provided, filter to groups the student is a member of
      if (studentId) {
        // This would need a more complex query to join with study_group_members
        // For now, we'll return all groups and filter in the field resolver'
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.eq('is_active', true)
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch study groups: ${error.message}')
      return data
    }
  },

  Mutation: {
    // Course Management
    createCourse: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const courseId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('education.courses')
        .insert([{
          id: courseId,
          business_id: context.businessId,
          title: input.title,
          slug: input.slug,
          description: input.description,
          short_description: input.shortDescription,
          course_code: input.courseCode,
          category: input.category,
          subcategory: input.subcategory,
          level: input.level,
          language: input.language,
          tags: input.tags || [],
          thumbnail_url: input.thumbnailUrl,
          trailer_url: input.trailerUrl,
          images: input.images || [],
          primary_instructor_id: input.instructorIds[0], // First instructor as primary
          status: 'DRAFT',
          is_published: false,
          pricing: input.pricing,
          access_type: input.accessType,
          requirements: input.requirements || [],
          outcomes: input.outcomes || [],
          skills: input.skills || [],
          enrollment_count: 0,
          completion_count: 0,
          average_rating: 0,
          review_count: 0,
          completion_rate: 0,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create course: ${error.message}')

      // Add additional instructors if provided
      if (input.instructorIds.length > 1) {
        const instructorInserts = input.instructorIds.slice(1).map((instructorId: string) => ({
          course_id: courseId,
          instructor_id: instructorId,
          role: 'INSTRUCTOR',
          created_at: new Date().toISOString()
        }))

        await supabase
          .from('education.course_instructors')
          .insert(instructorInserts)
      }

      return data
    },

    // Student Management
    createStudent: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const studentId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('education.students')
        .insert([{
          id: studentId,
          business_id: context.businessId,
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          phone: input.phone,
          date_of_birth: input.dateOfBirth,
          avatar_url: input.avatarUrl,
          bio: input.bio,
          location: input.location,
          timezone: input.timezone,
          language: input.language,
          education_level: input.educationLevel,
          profession: input.profession,
          company: input.company,
          interests: input.interests || [],
          goals: input.goals || [],
          learning_style: input.learningStyle,
          preferred_languages: input.preferredLanguages || [input.language],
          available_hours: input.availableHours,
          preferred_study_times: input.preferredStudyTimes || [],
          is_active: true,
          is_verified: false,
          total_xp: 0,
          level: 1,
          total_courses_enrolled: 0,
          total_courses_completed: 0,
          completion_rate: 0,
          average_grade: 0,
          total_time_spent: 0,
          current_streak: 0,
          longest_streak: 0,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create student: ${error.message}')
      return data
    },

    // Enrollment Management
    enrollStudent: async (_: unknown, { studentId, courseId, paymentInfo }: { studentId: string, courseId: string, paymentInfo?: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const enrollmentId = crypto.randomUUID()

      // Check if student is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('education.enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('business_id', context.businessId)
        .single()

      if (existingEnrollment) {
        throw new Error('Student is already enrolled in this course')
      }

      // Get course details for pricing
      const { data: course, error: courseError } = await supabase
        .from('education.courses')
        .select('pricing, passing_grade')
        .eq('id', courseId)
        .eq('business_id', context.businessId)
        .single()

      if (courseError) throw new Error('Course not found: ${courseError.message}')

      const { data, error } = await supabase
        .from('education.enrollments')
        .insert([{
          id: enrollmentId,
          business_id: context.businessId,
          student_id: studentId,
          course_id: courseId,
          status: 'ACTIVE',
          enrolled_at: new Date().toISOString(),
          payment_status: course.pricing.type === 'FREE' ? 'PAID' : 'PENDING`,
          amount_paid: course.pricing.amount || 0,
          payment_method: paymentInfo?.paymentMethod,
          passing_grade: course.passing_grade || 70,
          is_completed: false,
          completion_percentage: 0,
          has_passed: false,
          total_time_spent: 0,
          average_session_time: 0,
          session_count: 0,
          streak: 0,
          longest_streak: 0,
          progress: {
            completed_lessons: 0,
            total_lessons: 0,
            completed_modules: 0,
            total_modules: 0,
            completed_quizzes: 0,
            total_quizzes: 0,
            average_quiz_score: 0,
            time_spent: 0,
            milestones: []
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          student:education.students!enrollments_student_id_fkey (*),
          course:education.courses!enrollments_course_id_fkey (*)
        ')
        .single()

      if (error) throw new Error('Failed to enroll student: ${error.message}')

      // Update course enrollment count
      await supabase
        .from('education.courses')
        .update({ 
          enrollment_count: supabase.sql'enrollment_count + 1',
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

      // Update student enrollment count
      await supabase
        .from('education.students')
        .update({ 
          total_courses_enrolled: supabase.sql'total_courses_enrolled + 1',
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)

      return data
    },

    // Lesson Completion
    markLessonComplete: async (_: unknown, { lessonId, studentId, timeSpent }: { lessonId: string, studentId: string, timeSpent: number }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const completionId = crypto.randomUUID()

      // Get lesson and enrollment details
      const { data: lesson, error: lessonError } = await supabase
        .from('education.lessons')
        .select('course_id, module_id, xp_reward, order_index')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw new Error('Lesson not found: ${lessonError.message}')

      // Get enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('education.enrollments')
        .select('id, progress')
        .eq('student_id', studentId)
        .eq('course_id', lesson.course_id)
        .eq('business_id', context.businessId)
        .single()

      if (enrollmentError) throw new Error('Enrollment not found: ${enrollmentError.message}')

      // Create lesson completion record
      const { data, error } = await supabase
        .from('education.lesson_completions`)
        .insert([{
          id: completionId,
          lesson_id: lessonId,
          student_id: studentId,
          enrollment_id: enrollment.id,
          completed_at: new Date().toISOString(),
          time_spent: timeSpent,
          progress: 100,
          xp_earned: lesson.xp_reward || 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          lesson:education.lessons!lesson_completions_lesson_id_fkey (*),
          student:education.students!lesson_completions_student_id_fkey (*),
          enrollment:education.enrollments!lesson_completions_enrollment_id_fkey (*)
        ')
        .single()

      if (error) throw new Error('Failed to mark lesson complete: ${error.message}')

      // Update student XP
      await supabase
        .from('education.students')
        .update({ 
          total_xp: supabase.sql'total_xp + ${lesson.xp_reward || 10}',
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)

      // Update enrollment progress
      const updatedProgress = {
        ...enrollment.progress,
        completed_lessons: (enrollment.progress.completed_lessons || 0) + 1,
        time_spent: (enrollment.progress.time_spent || 0) + timeSpent,
        last_activity_at: new Date().toISOString()
      }

      await supabase
        .from('education.enrollments`)
        .update({ 
          progress: updatedProgress,
          total_time_spent: supabase.sql`total_time_spent + ${timeSpent}',
          session_count: supabase.sql'session_count + 1',
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id)

      return data
    },

    // Study Group Management
    createStudyGroup: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const studyGroupId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('education.study_groups`)
        .insert([{
          id: studyGroupId,
          business_id: context.businessId,
          name: input.name,
          description: input.description,
          type: input.type,
          privacy: input.privacy,
          max_members: input.maxMembers,
          current_member_count: 1, // Creator is first member
          is_active: true,
          course_id: input.courseId,
          topics: input.topics,
          created_by: context.userId, // Assuming userId maps to student
          total_messages: 0,
          total_members: 1,
          average_engagement: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          creator:education.students!study_groups_created_by_fkey (*),
          course:education.courses!study_groups_course_id_fkey (*)
        ')
        .single()

      if (error) throw new Error('Failed to create study group: ${error.message}')

      // Add creator as first member
      await supabase
        .from('education.study_group_members')
        .insert([{
          id: crypto.randomUUID(),
          study_group_id: studyGroupId,
          student_id: context.userId,
          role: 'CREATOR',
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          message_count: 0
        }])

      return data
    }
  },

  // Field Resolvers
  Course: {
    primaryInstructor: async (parent: unknown) => {
      if (!parent.primary_instructor_id) return null

      const { data, error } = await supabase
        .from('education.instructors')
        .select('*')
        .eq('id', parent.primary_instructor_id)
        .single()

      return error ? null : data
    },

    instructors: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.course_instructors')
        .select('
          instructor:education.instructors (*)
        ')
        .eq('course_id', parent.id)

      if (error) return []
      return data.map((ci: unknown) => ci.instructor)
    },

    totalLessons: async (parent: unknown) => {
      const { count, error } = await supabase
        .from('education.lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', parent.id)
        .eq('is_published', true)

      return error ? 0 : count || 0
    },

    totalDuration: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.lessons')
        .select('duration')
        .eq('course_id', parent.id)
        .eq('is_published', true)

      if (error) return 0

      return data.reduce((total, lesson) => total + (lesson.duration || 0), 0)
    },

    modules: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.course_modules')
        .select('*')
        .eq('course_id', parent.id)
        .eq('is_published', true)
        .order('order_index')

      return error ? [] : data
    }
  },

  Student: {
    fullName: (parent: unknown) => {
      return '${parent.first_name} ${parent.last_name}'
    },

    enrollments: async (parent: unknown, { status, pagination, filters, sorts }: any) => {
      let query = supabase
        .from('education.enrollments')
        .select('
          *,
          course:education.courses!enrollments_course_id_fkey (*)
        ', { count: 'exact' })
        .eq('student_id', parent.id)

      if (status) {
        query = query.eq('status', status)
      }

      // Apply filters and sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('enrolled_at', { ascending: false })
      }

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((enrollment: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: enrollment
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    level: (parent: unknown) => {
      // Calculate level based on XP (every 1000 XP = 1 level)
      return Math.floor((parent.total_xp || 0) / 1000) + 1
    },

    badges: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.student_badges')
        .select('
          *,
          badge:education.badges!student_badges_badge_id_fkey (*)
        ')
        .eq('student_id', parent.id)
        .eq('is_unlocked', true)

      return error ? [] : data.map((sb: unknown) => sb.badge)
    }
  },

  Enrollment: {
    student: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.students')
        .select('*')
        .eq('id', parent.student_id)
        .single()

      return error ? null : data
    },

    course: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.courses')
        .select('*')
        .eq('id', parent.course_id)
        .single()

      return error ? null : data
    },

    currentLesson: async (parent: unknown) => {
      if (!parent.current_lesson_id) return null

      const { data, error } = await supabase
        .from('education.lessons')
        .select('*')
        .eq('id', parent.current_lesson_id)
        .single()

      return error ? null : data
    },

    completionPercentage: (parent: unknown) => {
      const progress = parent.progress || {}
      if (!progress.total_lessons || progress.total_lessons === 0) return 0
      return Math.round((progress.completed_lessons / progress.total_lessons) * 100)
    }
  },

  Lesson: {
    module: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.course_modules')
        .select('*')
        .eq('id', parent.module_id)
        .single()

      return error ? null : data
    },

    course: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('education.courses')
        .select('*')
        .eq('id', parent.course_id)
        .single()

      return error ? null : data
    },

    quiz: async (parent: unknown) => {
      if (!parent.has_quiz) return null

      const { data, error } = await supabase
        .from('education.quizzes')
        .select('*')
        .eq('lesson_id', parent.id)
        .single()

      return error ? null : data
    },

    completionRate: async (parent: unknown) => {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('education.enrollments')
        .select('id')
        .eq('course_id', parent.course_id)
        .eq('status', 'ACTIVE')

      if (enrollmentError || !enrollments.length) return 0

      const { count: completions, error: completionError } = await supabase
        .from('education.lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', parent.id)

      if (completionError) return 0

      return Math.round(((completions || 0) / enrollments.length) * 100)
    }
  }
}

export default educationResolvers
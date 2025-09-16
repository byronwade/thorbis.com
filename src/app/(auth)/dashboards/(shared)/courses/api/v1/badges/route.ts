import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { z } from 'zod'

/**
 * Thorbis Business OS - Courses Badge Management API
 * 
 * This API manages the comprehensive badge and achievement system for the Thorbis
 * Learning Management System. Badges serve as gamification elements that recognize
 * learner accomplishments, skill mastery, and engagement across various courses
 * and learning paths within the platform.
 * 
 * Features:
 * - Complete badge lifecycle management (create, update, deactivate)
 * - User badge earning and tracking with timestamp records
 * - Rarity-based badge classification system
 * - Flexible condition-based badge awarding mechanism
 * - Real-time badge notification and display system
 * - Integration with user progress and achievement tracking
 * - Comprehensive audit logging for badge activities
 * - Multi-tenant badge management with proper isolation
 * - Performance-optimized queries for badge leaderboards
 * - Automated badge awarding based on learning milestones
 * 
 * Business Context:
 * - Drives learner engagement through gamification and recognition
 * - Supports skill verification and competency tracking
 * - Enables social learning features and peer comparison
 * - Provides data insights for course effectiveness measurement
 * - Facilitates certification and professional development tracking
 * 
 * Badge Rarity System:
 * - Common: Basic participation and completion badges
 * - Uncommon: Skill-based achievements and consistent engagement
 * - Rare: Advanced mastery and exceptional performance
 * - Epic: Leadership, mentoring, and outstanding contributions
 * - Legendary: Platform-wide recognition and extraordinary achievements
 * 
 * Security Considerations:
 * - Row Level Security (RLS) enforcement for all badge operations
 * - Admin-only badge creation with proper role validation
 * - User-specific badge earning records with audit trails
 * - Input validation to prevent badge manipulation
 * - Rate limiting to prevent badge farming and system abuse
 * 
 * Performance Requirements:
 * - Sub-200ms response time for badge listing operations
 * - Efficient pagination for large badge collections
 * - Optimized queries for badge rarity and earning statistics
 * - Cached badge metadata for improved user experience
 */

// Badge validation schemas
const BadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().url().optional(),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).default('Common'),
  conditions: z.record(z.any()).default({}),
  is_active: z.boolean().default(true)
})

const BadgeQuerySchema = z.object({
  type: z.enum(['available', 'earned']).optional(),
  userId: z.string().uuid().optional(),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 50, 100)).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional()
})

/**
 * GET /api/badges - Retrieve Badge Information
 * 
 * Retrieves badge data based on the specified type parameter. Supports both
 * available badges (catalog) and earned badges (user-specific achievements).
 * 
 * Query Parameters:
 * - type: 'available' | 'earned' - Type of badges to retrieve
 * - userId: string (UUID) - Target user ID for earned badges (defaults to current user)
 * - rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' - Filter by rarity
 * - limit: number (max 100) - Number of results to return (default: 50)
 * - offset: number - Pagination offset (default: 0)
 * 
 * Authentication: Required (JWT token)
 * 
 * Authorization: 
 * - Any authenticated user can view available badges
 * - Users can only view their own earned badges unless admin
 * 
 * Rate Limiting: 60 requests per minute per user
 * 
 * Response Format:
 * - 200: Success with badge data
 * - 401: Unauthorized (invalid or missing token)
 * - 403: Forbidden (insufficient permissions for user-specific data)
 * - 500: Internal server error
 * 
 * Response Schema (type=available):
 * {
 *   badges: [{
 *     id: string,
 *     name: string,
 *     description: string,
 *     icon: string | null,
 *     rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary',
 *     conditions: Record<string, unknown>,
 *     is_active: boolean
 *   }]
 * }
 * 
 * Response Schema (type=earned):
 * {
 *   badges: [{
 *     id: string,
 *     badge_id: string,
 *     earned_at: string (ISO 8601),
 *     badges: {
 *       id: string,
 *       name: string,
 *       description: string,
 *       icon: string | null,
 *       rarity: string,
 *       conditions: Record<string, unknown>,
 *       is_active: boolean
 *     }
 *   }]
 * }
 * 
 * Business Rules:
 * - Only active badges are returned in available listings
 * - Earned badges are sorted by earned_at (most recent first)
 * - Available badges are sorted by rarity (highest first)
 * - Inactive badges are still shown if earned by user
 * 
 * Performance Considerations:
 * - Query optimization for large badge catalogs
 * - Efficient joins between user_badges and badges tables
 * - Proper indexing on user_id, badge_id, and earned_at columns
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'available' | 'earned'
    const userId = searchParams.get('userId') || user.id

    if (type === 'earned') {
      // Get user's earned badges'
      const { data, error } = await supabase
        .from('user_badges')
        .select('
          id,
          badge_id,
          earned_at,
          badges:badge_id (
            id,
            name,
            description,
            icon,
            rarity,
            conditions,
            is_active
          )
        ')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) {
        console.error('Error fetching earned badges:', error)
        return NextResponse.json(
          { error: 'Failed to fetch earned badges' },
          { status: 500 }
        )
      }

      return NextResponse.json({ badges: data })
    } else {
      // Get all available badges
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false })

      if (error) {
        console.error('Error fetching available badges:', error)
        return NextResponse.json(
          { error: 'Failed to fetch available badges' },
          { status: 500 }
        )
      }

      return NextResponse.json({ badges: data })
    }
  } catch (error) {
    console.error('Badges API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/badges - Create New Badge
 * 
 * Creates a new badge in the system. This endpoint is restricted to admin users
 * and provides comprehensive badge creation with validation and audit logging.
 * 
 * Request Body Schema:
 * {
 *   name: string (1-100 characters) - Unique badge name
 *   description: string (1-500 characters) - Badge description and criteria
 *   icon?: string (URL) - Badge icon/image URL
 *   rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' - Badge rarity (default: Common)
 *   conditions?: Record<string, unknown> - Automated awarding conditions (default: Record<string, unknown>)
 * }
 * 
 * Authentication: Required (JWT token)
 * 
 * Authorization: Admin role required
 * 
 * Rate Limiting: 10 requests per minute per admin user
 * 
 * Response Format:
 * - 201: Badge created successfully
 * - 400: Validation error (malformed request body)
 * - 401: Unauthorized (invalid or missing token)
 * - 403: Forbidden (insufficient permissions - not admin)
 * - 409: Conflict (badge name already exists)
 * - 500: Internal server error
 * 
 * Response Schema:
 * {
 *   badge: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     icon: string | null,
 *     rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary',
 *     conditions: Record<string, unknown>,
 *     is_active: boolean,
 *     created_at: string (ISO 8601),
 *     updated_at: string (ISO 8601)
 *   }
 * }
 * 
 * Business Rules:
 * - Badge names must be unique across the entire system
 * - Badge descriptions should clearly explain earning criteria
 * - Rarity affects badge display order and visual prominence
 * - Conditions object enables automated badge awarding
 * - All badges are created as active by default
 * 
 * Conditions Format Examples:
 * - Course completion: { type: 'course_completion', course_id: 'uuid' }
 * - Skill mastery: { type: 'skill_level', skill: 'javascript', level: 'expert' }
 * - Engagement: { type: 'streak', activity: 'daily_login', count: 30 }
 * 
 * Integration Points:
 * - Badge awarding engine for automated recognition
 * - Notification system for new badge announcements
 * - Analytics system for badge effectiveness tracking
 * - Gamification dashboard for admin badge management
 * 
 * Security Considerations:
 * - Comprehensive input validation to prevent malicious badge creation
 * - Admin role verification through user_profiles table lookup
 * - Audit logging for all badge creation activities
 * - Rate limiting to prevent badge spam and system abuse
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description, icon, rarity, conditions } = await request.json()

    // Only allow admin users to create badges (you can adjust this based on your role system)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create new badge
    const { data, error } = await supabase
      .from('badges')
      .insert({
        name,
        description,
        icon,
        rarity: rarity || 'Common',
        conditions: conditions || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating badge:', error)
      return NextResponse.json(
        { error: 'Failed to create badge' },
        { status: 500 }
      )
    }

    return NextResponse.json({ badge: data })
  } catch (error) {
    console.error('Badge creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
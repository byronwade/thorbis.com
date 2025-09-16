import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

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
    const userId = searchParams.get('userId') || user.id
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get XP transactions for user
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching XP transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch XP transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transactions: data })
  } catch (error) {
    console.error('XP transactions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { amount, reason, sourceType, sourceId, targetUserId } = await request.json()

    if (!amount || !reason || !sourceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userId = targetUserId || user.id

    // Use the database function to update user XP and level
    const { error: xpError } = await supabase.rpc('update_user_xp', {
      user_id_param: userId,
      xp_to_add: amount
    })

    if (xpError) {
      console.error('Error updating XP:', xpError)
      return NextResponse.json(
        { error: 'Failed to update XP' },
        { status: 500 }
      )
    }

    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('level, total_xp')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching updated profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch updated profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      newLevel: profile.level,
      newTotalXP: profile.total_xp
    })
  } catch (error) {
    console.error('XP award error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Award XP for specific actions
export async function PUT(request: NextRequest) {
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

    const { action, courseId, lessonId } = await request.json()

    let xpAmount = 0
    let reason = `
    let sourceType = '
    let sourceId = '

    // Define XP rewards for different actions
    switch (action) {
      case 'lesson_completed':
        xpAmount = 25
        reason = 'Lesson completed'
        sourceType = 'lesson'
        sourceId = lessonId
        break
      case 'course_completed':
        xpAmount = 100
        reason = 'Course completed'
        sourceType = 'course'
        sourceId = courseId
        break
      case 'quiz_passed':
        xpAmount = 50
        reason = 'Quiz passed'
        sourceType = 'lesson'
        sourceId = lessonId
        break
      case 'first_lesson':
        xpAmount = 10
        reason = 'First lesson completed'
        sourceType = 'course'
        sourceId = courseId
        break
      case 'daily_streak':
        xpAmount = 15
        reason = 'Daily streak maintained'
        sourceType = 'streak'
        break
      case 'perfect_score':
        xpAmount = 75
        reason = 'Perfect quiz score'
        sourceType = 'lesson'
        sourceId = lessonId
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Use the database function to update user XP
    const { error: xpError } = await supabase.rpc('update_user_xp', {
      user_id_param: user.id,
      xp_to_add: xpAmount
    })

    if (xpError) {
      console.error('Error awarding XP:', xpError)
      return NextResponse.json(
        { error: 'Failed to award XP' },
        { status: 500 }
      )
    }

    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('level, total_xp')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching updated profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      xpAwarded: xpAmount,
      reason,
      newLevel: profile?.level,
      newTotalXP: profile?.total_xp
    })
  } catch (error) {
    console.error('XP action award error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
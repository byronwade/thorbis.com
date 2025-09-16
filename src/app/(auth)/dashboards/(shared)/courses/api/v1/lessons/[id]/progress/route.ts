import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .select('
        *,
        lesson:lessons(
          title,
          duration_minutes,
          lesson_type
        )
      ')
      .eq('lesson_id', resolvedParams.id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      progress: progress || {
        lesson_id: resolvedParams.id,
        user_id: userId,
        progress_percentage: 0,
        completed_at: null,
        time_spent_minutes: 0
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch lesson progress' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { userId, progressPercentage, timeSpent, currentPosition, completionData } = await request.json();

    if (!userId || progressPercentage === undefined) {
      return NextResponse.json(
        { error: 'User ID and progress percentage are required' },
        { status: 400 }
      );
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, title, duration_minutes')
      .eq('id', resolvedParams.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is enrolled in the course
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', lesson.course_id)
      .eq('user_id', userId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .eq('user_id', userId)
      .single();

    const progressData = {
      lesson_id: resolvedParams.id,
      user_id: userId,
      course_id: lesson.course_id,
      progress_percentage: Math.min(Math.max(progressPercentage, 0), 100),
      time_spent_minutes: timeSpent || 0,
      current_position: currentPosition,
      completion_data: completionData || {},
      updated_at: now,
      // Only set completed_at if progress is 100% and not already completed
      ...(progressPercentage >= 100 && (!existingProgress?.completed_at) 
        ? { completed_at: now }
        : Record<string, unknown>
      )
    };

    let progress;

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .update(progressData)
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      progress = data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert([progressData])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      progress = data;
    }

    // If lesson was just completed (100% and not previously completed)
    if (progressPercentage >= 100 && !existingProgress?.completed_at) {
      // Award XP for lesson completion
      const xpEarned = Math.round((lesson.duration_minutes || 0) * 2); // 2 XP per minute
      if (xpEarned > 0) {
        await supabase
          .from('xp_transactions')
          .insert([
            {
              user_id: userId,
              source_type: 'lesson_completion',
              source_id: resolvedParams.id,
              xp_amount: xpEarned,
              description: 'Completed lesson: ${lesson.title}',
              created_at: now
            }
          ]);

        // Update user's total XP'
        await supabase.rpc('add_user_xp', {
          p_user_id: userId,
          p_xp_amount: xpEarned
        });
      }

      // Update course progress
      await updateCourseProgress(lesson.course_id, userId);
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    );
  }
}

async function updateCourseProgress(courseId: string, userId: string) {
  try {
    // Get total lessons in course
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true);

    // Get completed lessons
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    const totalLessons = allLessons?.length || 0;
    const completedCount = completedLessons?.length || 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const now = new Date().toISOString();
    const isCompleted = progressPercentage >= 100;

    // Update course enrollment progress
    await supabase
      .from('course_enrollments')
      .update({
        progress: progressPercentage,
        completed_at: isCompleted ? now : null,
        updated_at: now
      })
      .eq('course_id', courseId)
      .eq('user_id', userId);

    // If course is completed, award bonus XP
    if (isCompleted) {
      const { data: course } = await supabase
        .from('courses')
        .select('title, estimated_hours')
        .eq('id', courseId)
        .single();

      if (course) {
        const bonusXP = Math.round((course.estimated_hours || 1) * 50); // 50 XP per estimated hour
        
        await supabase
          .from('xp_transactions')
          .insert([
            {
              user_id: userId,
              source_type: 'course_completion',
              source_id: courseId,
              xp_amount: bonusXP,
              description: 'Completed course: ${course.title}',
              created_at: now
            }
          ]);

        await supabase.rpc('add_user_xp', {
          p_user_id: userId,
          p_xp_amount: bonusXP
        });
      }
    }
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
}
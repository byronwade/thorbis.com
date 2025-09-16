import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { userId, timeSpent, completionData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('
        *,
        course:courses(*)
      ')
      .eq('id', resolvedParams.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is enrolled in the course
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', lesson.course_id)
      .eq('user_id', userId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if lesson is already completed
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .eq('user_id', userId)
      .single();

    const now = new Date().toISOString();

    let lessonProgress;

    if (existingProgress && existingProgress.completed_at) {
      // Already completed, just update time spent if provided
      if (timeSpent) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .update({
            time_spent_minutes: (existingProgress.time_spent_minutes || 0) + timeSpent,
            updated_at: now
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        lessonProgress = data;
      } else {
        lessonProgress = existingProgress;
      }
    } else {
      // Mark as completed
      const progressData = {
        lesson_id: resolvedParams.id,
        user_id: userId,
        course_id: lesson.course_id,
        completed_at: now,
        time_spent_minutes: timeSpent || 0,
        completion_data: completionData || {},
        progress_percentage: 100,
        updated_at: now
      };

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
        lessonProgress = data;
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
        lessonProgress = data;
      }

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
    }

    // Calculate course progress
    await updateCourseProgress(lesson.course_id, userId);

    return NextResponse.json({
      lessonProgress,
      xpEarned: !existingProgress?.completed_at ? Math.round((lesson.duration_minutes || 0) * 2) : 0
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
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

    // If course is completed, award bonus XP and check for certificates
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
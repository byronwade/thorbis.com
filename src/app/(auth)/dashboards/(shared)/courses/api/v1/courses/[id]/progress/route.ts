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
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data: progress, error } = await supabase
      .from('course_enrollments')
      .select('
        *,
        lesson_completions (
          lesson_id,
          completed_at,
          score
        )
      ')
      .eq('course_id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      progress: progress || {
        course_id: id,
        user_id: userId,
        progress: 0,
        lesson_completions: []
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId, lessonId, progress, score, completed } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update or create course enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .upsert([
        {
          course_id: id,
          user_id: userId,
          progress: progress,
          last_accessed: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (enrollmentError) {
      return NextResponse.json({ error: enrollmentError.message }, { status: 400 });
    }

    // If lesson completion data provided, update lesson progress
    if (lessonId) {
      const { error: lessonError } = await supabase
        .from('lesson_completions')
        .upsert([
          {
            course_id: id,
            lesson_id: lessonId,
            user_id: userId,
            completed_at: completed ? new Date().toISOString() : null,
            score: score || null,
          }
        ]);

      if (lessonError) {
        return NextResponse.json({ error: lessonError.message }, { status: 400 });
      }

      // Award XP if lesson completed
      if (completed) {
        const xpReward = score >= 80 ? 50 : 25;
        
        const { error: xpError } = await supabase.rpc('update_user_xp', {
          user_id_param: userId,
          xp_to_add: xpReward
        });

        if (xpError) {
          console.error('Failed to award XP:', xpError);
        }
      }
    }

    return NextResponse.json({ enrollment });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
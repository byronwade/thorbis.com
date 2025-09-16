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
    const { data: course, error } = await supabase
      .from('courses')
      .select('
        *,
        instructor:user_profiles!instructor_id(name, avatar_url),
        lessons (
          *,
          lesson_content(*),
          lesson_assessments(*)
        ),
        course_enrollments (
          id,
          progress,
          completed_at,
          user_id
        )
      ')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Process course with additional metadata
    const courseWithMetadata = {
      ...course,
      enrolled: course.course_enrollments?.length || 0,
      lessonCount: course.lessons?.length || 0,
      totalDuration: course.lessons?.reduce((total: number, lesson: unknown) => total + (lesson.duration_minutes || 0), 0) || 0,
      publishedLessons: course.lessons?.filter((lesson: unknown) => lesson.is_published).length || 0,
    };

    return NextResponse.json({ course: courseWithMetadata });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const courseData = await request.json();
    const {
      title,
      description,
      category,
      difficultyLevel,
      estimatedHours,
      thumbnailUrl,
      isFeatured,
      isPublished,
      tags,
      prerequisites
    } = courseData;

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        category,
        difficulty_level: difficultyLevel,
        estimated_hours: estimatedHours,
        thumbnail_url: thumbnailUrl,
        is_featured: isFeatured,
        is_published: isPublished,
        tags: tags,
        prerequisites: prerequisites,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('
        *,
        instructor:user_profiles!instructor_id(name, avatar_url)
      ')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ course });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if course has any enrollments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', id);

    if (enrollments && enrollments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Archive it instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
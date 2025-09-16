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
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('
        *,
        user_badges (
          badge_id,
          earned_at,
          badges (
            id,
            name,
            description,
            icon,
            rarity
          )
        ),
        course_enrollments (
          course_id,
          progress,
          completed_at,
          courses (
            id,
            title,
            category
          )
        )
      ')
      .eq('user_id', resolvedParams.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
    const profileData = await request.json();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([
        {
          user_id: resolvedParams.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data[0] });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
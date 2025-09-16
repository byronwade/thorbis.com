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
    const { data: group, error } = await supabase
      .from('study_groups')
      .select('
        *,
        moderator:user_profiles!moderator_id(name, avatar_url),
        study_group_members(
          user_id,
          role,
          joined_at,
          user:user_profiles(
            name,
            avatar_url,
            level,
            total_xp
          )
        ),
        study_group_messages(
          id,
          content,
          created_at,
          user:user_profiles(
            name,
            avatar_url
          )
        )
      ')
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!group) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch study group' },
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
    const updateData = await request.json();

    const { data: group, error } = await supabase
      .from('study_groups')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ group });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update study group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Study group deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete study group' },
      { status: 500 }
    );
  }
}
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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if group exists and has capacity
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('id, max_members, study_group_members(id)')
      .eq('id', resolvedParams.id)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    const currentMembers = group.study_group_members?.length || 0;
    if (currentMembers >= group.max_members) {
      return NextResponse.json(
        { error: 'Study group is at maximum capacity' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', resolvedParams.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Add user to group
    const { data: membership, error: memberError } = await supabase
      .from('study_group_members')
      .insert([
        {
          group_id: resolvedParams.id,
          user_id: userId,
          role: 'member'
        }
      ])
      .select('
        *,
        user:user_profiles(name, avatar_url, level)
      ')
      .single();

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ membership });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to join study group' },
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', resolvedParams.id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Left study group successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to leave study group' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public');

    let query = supabase
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
            level
          )
        )
      ')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    const { data: groups, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Process groups with member counts and user membership
    const processedGroups = groups?.map(group => ({
      ...group,
      memberCount: group.study_group_members?.length || 0,
      isJoined: userId ? group.study_group_members?.some((member: unknown) => member.user_id === userId) : false,
      members: group.study_group_members || []
    }));

    return NextResponse.json({ groups: processedGroups });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, category, maxMembers, isPublic, moderatorId } = await request.json();

    if (!name || !moderatorId) {
      return NextResponse.json(
        { error: 'Name and moderator ID are required' },
        { status: 400 }
      );
    }

    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .insert([
        {
          name,
          description,
          category,
          max_members: maxMembers || 50,
          is_public: isPublic !== false,
          moderator_id: moderatorId,
        }
      ])
      .select()
      .single();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 400 });
    }

    // Add moderator as a member
    const { error: memberError } = await supabase
      .from('study_group_members')
      .insert([
        {
          group_id: group.id,
          user_id: moderatorId,
          role: 'moderator'
        }
      ]);

    if (memberError) {
      console.error('Failed to add moderator as member:', memberError);
    }

    return NextResponse.json({ group });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create study group' },
      { status: 500 }
    );
  }
}
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    let query = supabase
      .from('study_group_messages')
      .select('
        id,
        content,
        message_type,
        created_at,
        user:user_profiles(
          user_id,
          name,
          avatar_url,
          level
        )
      ')
      .eq('group_id', resolvedParams.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Reverse to get chronological order (oldest first)
    const reversedMessages = messages?.reverse() || [];

    return NextResponse.json({ messages: reversedMessages });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { content, userId, messageType = 'text' } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and user ID are required' },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', resolvedParams.id)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }

    const { data: message, error } = await supabase
      .from('study_group_messages')
      .insert([
        {
          group_id: resolvedParams.id,
          user_id: userId,
          content,
          message_type: messageType,
        }
      ])
      .select('
        id,
        content,
        message_type,
        created_at,
        user:user_profiles(
          user_id,
          name,
          avatar_url,
          level
        )
      ')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
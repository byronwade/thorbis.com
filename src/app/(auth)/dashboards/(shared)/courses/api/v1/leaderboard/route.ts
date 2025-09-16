import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const category = searchParams.get('category');

    let dateFilter = ';
    const now = new Date();
    
    switch (period) {
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
        break;
      case 'allTime':
        dateFilter = '1970-01-01T00:00:00.000Z';
        break;
    }

    const query = supabase
      .from('user_profiles')
      .select('
        user_id,
        name,
        avatar_url,
        level,
        total_xp,
        streak_days,
        industry,
        role,
        user_badges (
          badges (
            name,
            rarity
          )
        )
      ')
      .order('total_xp', { ascending: false })
      .limit(50);

    const { data: leaderboard, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate period-specific XP if not all-time
    let processedLeaderboard = leaderboard;

    if (period !== 'allTime') {
      const { data: periodXP, error: periodError } = await supabase
        .from('xp_transactions')
        .select('
          user_id,
          amount
        ')
        .gte('created_at', dateFilter);

      if (!periodError && periodXP) {
        const periodXPMap = periodXP.reduce((acc: Record<string, number>, transaction: unknown) => {
          acc[transaction.user_id] = (acc[transaction.user_id] || 0) + transaction.amount;
          return acc;
        }, {});

        processedLeaderboard = leaderboard
          .map((user: unknown) => ({
            ...user,
            period_xp: periodXPMap[user.user_id] || 0,
          }))
          .sort((a: unknown, b: unknown) => b.period_xp - a.period_xp);
      }
    }

    return NextResponse.json({ 
      leaderboard: processedLeaderboard,
      period,
      total: processedLeaderboard?.length || 0
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
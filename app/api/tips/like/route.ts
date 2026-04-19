import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import type { Database } from '@/app/types/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { tipId?: unknown } | null;
    const tipId = typeof body?.tipId === 'string' ? body.tipId : '';
    if (!tipId) {
      return NextResponse.json({ error: 'tipId is required' }, { status: 400 });
    }

    // Toggle: try delete first, if no row was affected, insert.
    const { data: existing } = await supabase
      .from('issue_tip_likes')
      .select('tip_id')
      .eq('tip_id', tipId)
      .eq('user_id', user.id)
      .maybeSingle<{ tip_id: string }>();

    if (existing) {
      const { error: delErr } = await supabase
        .from('issue_tip_likes')
        .delete()
        .eq('tip_id', tipId)
        .eq('user_id', user.id);
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
      return NextResponse.json({ liked: false });
    }

    const insertRow: Database['public']['Tables']['issue_tip_likes']['Insert'] = {
      tip_id: tipId,
      user_id: user.id,
    };

    const { error: insErr } = await supabase
      .from('issue_tip_likes')
      .insert(insertRow as never);
    if (insErr) {
      // 23505 = unique_violation. The select-then-insert toggle is racy; if a
      // concurrent request already inserted the row, treat as success.
      if ((insErr as { code?: string }).code === '23505') {
        return NextResponse.json({ liked: true });
      }
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Error toggling tip like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

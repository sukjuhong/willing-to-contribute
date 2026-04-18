import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import type { Database } from '@/app/types/supabase';

const MAX_REASON_LENGTH = 280;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      tipId?: unknown;
      reason?: unknown;
    } | null;

    const tipId = typeof body?.tipId === 'string' ? body.tipId : '';
    const reasonRaw = typeof body?.reason === 'string' ? body.reason.trim() : '';
    const reason = reasonRaw.slice(0, MAX_REASON_LENGTH) || null;

    if (!tipId) {
      return NextResponse.json({ error: 'tipId is required' }, { status: 400 });
    }

    const insertRow: Database['public']['Tables']['issue_tip_reports']['Insert'] = {
      tip_id: tipId,
      user_id: user.id,
      reason,
    };

    const { error } = await supabase.from('issue_tip_reports').insert(insertRow as never);

    if (error) {
      // Duplicate report (PK conflict) — surface as 409 so client can show "already reported"
      if (error.code === '23505') {
        return NextResponse.json({ error: 'already reported' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error filing tip report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

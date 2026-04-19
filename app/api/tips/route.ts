import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import type { Database } from '@/app/types/supabase';

const MAX_CONTENT_LENGTH = 280;

// Constrain `issue_url` to canonical GitHub issue/PR form so the table can't be
// used as arbitrary key/value storage (e.g. `https://example.com/#xss`).
const ISSUE_URL_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/\d+$/;

function isValidIssueUrl(url: string): boolean {
  return ISSUE_URL_RE.test(url);
}

type TipRow = Database['public']['Tables']['issue_tips']['Row'];

export async function GET(req: NextRequest) {
  try {
    const issueUrl = req.nextUrl.searchParams.get('issueUrl');
    if (!issueUrl || !isValidIssueUrl(issueUrl)) {
      return NextResponse.json(
        { error: 'Valid GitHub issue or PR URL is required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('issue_tips')
      .select('id, issue_url, user_id, content, like_count, created_at')
      .eq('issue_url', issueUrl)
      .is('hidden_at', null)
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })
      .returns<
        Array<
          Pick<
            TipRow,
            'id' | 'issue_url' | 'user_id' | 'content' | 'like_count' | 'created_at'
          >
        >
      >();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tips = data ?? [];
    const tipIds = tips.map(t => t.id);

    // Likes/reports the current user has made (used to render toggle state)
    let likedSet = new Set<string>();
    let reportedSet = new Set<string>();
    if (user && tipIds.length > 0) {
      const [{ data: likes }, { data: reports }] = await Promise.all([
        supabase
          .from('issue_tip_likes')
          .select('tip_id')
          .eq('user_id', user.id)
          .in('tip_id', tipIds)
          .returns<Array<{ tip_id: string }>>(),
        supabase
          .from('issue_tip_reports')
          .select('tip_id')
          .eq('user_id', user.id)
          .in('tip_id', tipIds)
          .returns<Array<{ tip_id: string }>>(),
      ]);
      likedSet = new Set((likes ?? []).map(r => r.tip_id));
      reportedSet = new Set((reports ?? []).map(r => r.tip_id));
    }

    const enriched = tips.map(t => ({
      id: t.id,
      issueUrl: t.issue_url,
      userId: t.user_id,
      content: t.content,
      likeCount: t.like_count,
      createdAt: t.created_at,
      isOwn: user ? t.user_id === user.id : false,
      isLiked: likedSet.has(t.id),
      isReported: reportedSet.has(t.id),
    }));

    return NextResponse.json({ tips: enriched, total: enriched.length });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      issueUrl?: unknown;
      content?: unknown;
    } | null;

    const issueUrl = typeof body?.issueUrl === 'string' ? body.issueUrl.trim() : '';
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!issueUrl || !isValidIssueUrl(issueUrl)) {
      return NextResponse.json(
        { error: 'Valid GitHub issue or PR URL is required' },
        { status: 400 },
      );
    }
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `content must be ${MAX_CONTENT_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const insertRow: Database['public']['Tables']['issue_tips']['Insert'] = {
      issue_url: issueUrl,
      user_id: user.id,
      content,
    };

    const { data, error } = await supabase
      .from('issue_tips')
      .insert(insertRow as never)
      .select('id, issue_url, user_id, content, like_count, created_at')
      .single<
        Pick<
          TipRow,
          'id' | 'issue_url' | 'user_id' | 'content' | 'like_count' | 'created_at'
        >
      >();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create tip' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      tip: {
        id: data.id,
        issueUrl: data.issue_url,
        userId: data.user_id,
        content: data.content,
        likeCount: data.like_count,
        createdAt: data.created_at,
        isOwn: true,
        isLiked: false,
        isReported: false,
      },
    });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RLS enforces ownership; the eq filter is belt-and-suspenders.
    const { error } = await supabase
      .from('issue_tips')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

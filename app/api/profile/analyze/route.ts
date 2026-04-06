import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { analyzeUserProfile } from '@/app/lib/github/profileAnalyzer';
import type { Database } from '@/app/types/supabase';

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ error: 'GitHub token not available' }, { status: 400 });
    }

    const username = session.user.user_metadata?.user_name as string | undefined;
    if (!username) {
      return NextResponse.json({ error: 'Username not found' }, { status: 400 });
    }

    const octokit = new Octokit({ auth: providerToken });
    const profile = await analyzeUserProfile(octokit, username);

    const row: UserProfileInsert = {
      id: session.user.id,
      username: profile.username,
      top_languages: profile.top_languages,
      starred_categories: profile.starred_categories,
      contributed_repos: profile.contributed_repos,
      last_synced_at: new Date().toISOString(),
    };
    // @supabase/ssr upsert() overload resolution fails with custom Database types
    const { error } = await supabase.from('user_profiles').upsert(row as never);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      return NextResponse.json(null);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

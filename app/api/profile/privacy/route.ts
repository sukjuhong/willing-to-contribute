import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { is_public: boolean; public_fields?: unknown };
    const { is_public, public_fields } = body;

    if (typeof is_public !== 'boolean') {
      return NextResponse.json({ error: 'is_public must be a boolean' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_public, public_fields: public_fields ?? null } as never)
      .eq('id', session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ is_public, public_fields: public_fields ?? null });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

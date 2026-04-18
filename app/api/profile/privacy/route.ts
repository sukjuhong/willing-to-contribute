import { createClient } from '@/app/lib/supabase/server';
import { Database } from '@/app/types/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { is_public: boolean; public_fields?: unknown };
    const { is_public } = body;

    if (typeof is_public !== 'boolean') {
      return NextResponse.json({ error: 'is_public must be a boolean' }, { status: 400 });
    }

    const updateData: Database['public']['Tables']['user_profiles']['Update'] = {
      is_public,
    };
    if ('public_fields' in body) {
      updateData.public_fields =
        body.public_fields as Database['public']['Tables']['user_profiles']['Update']['public_fields'];
    }

    // `as never` is required due to hand-written Database type not fully
    // satisfying supabase-js update overload generics. updateData is still
    // statically typed as the Update schema above.
    const { error } = await supabase
      .from('user_profiles')
      .update(updateData as never)
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

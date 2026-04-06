import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/app/types/supabase';
import { env } from '@/app/lib/env';

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  );
}

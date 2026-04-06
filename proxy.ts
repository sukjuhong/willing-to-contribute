import { updateSession } from '@/app/lib/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Refresh Supabase session (updates auth cookies)
  const supabaseResponse = await updateSession(request);

  // Run next-intl locale routing middleware
  const intlResponse = intlMiddleware(request);

  // Copy Supabase auth cookies onto the intl response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie as Parameters<typeof intlResponse.cookies.set>[2]);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

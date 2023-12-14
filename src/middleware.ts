import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuth } from './lib/interfaces';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  ////* supabase middleware to get Supabase Auth session (no next auth): Route protection with Supabase Auth
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // route protection
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  ///* validate email confimation link
  const emailLinkError = 'Email link is invalid or has expired';
  if (
    // supabase set search params: error_description
    req.nextUrl.searchParams.get(SupabaseAuth.errorDescriptionParamKey) ===
      emailLinkError &&
    req.nextUrl.pathname !== '/signup'
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?${
          SupabaseAuth.errorDescriptionParamKey
        }=${req.nextUrl.searchParams.get(
          `${SupabaseAuth.errorDescriptionParamKey}`
        )}`,
        req.url
      )
    );
  }

  ///* validate auth pages for auth users
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  return res;
}

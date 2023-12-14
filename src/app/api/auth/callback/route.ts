import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';


////* Managing sign-in with Code Exchange
// https://supabase.com/docs/guides/auth/auth-helpers/nextjs?language=ts#managing-sign-in-with-code-exchange


export async function GET(req: NextRequest) { // <-- actionSignUpUser()

  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }


  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);

}

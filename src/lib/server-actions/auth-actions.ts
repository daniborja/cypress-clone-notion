'use server'; // explicit 'cause this file is imported by 'use client'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { LoginSchema } from '../helpers';

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof LoginSchema>) {
  const supabase = createRouteHandlerClient({ cookies });

  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof LoginSchema>) {
  const supabase = createRouteHandlerClient({ cookies });

  // Queries with Supabase: validate user alredy registered
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);
  if (data?.length) return { error: { message: 'User already exists', data } };

  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      // it calls auth callback route.ts
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });
  return response;
}

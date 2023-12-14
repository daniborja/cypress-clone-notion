'use client'; // router & react hooks

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import LOGO from '../../../../public/cypresslogo.svg';

import { Loader } from '@/components/shared';
import { Button, Input } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { SignupSchema } from '@/lib/helpers';
import { MailCheck } from 'lucide-react';
import { actionSignUpUser } from '@/lib/server-actions';

export type SignupPageProps = {};

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupPage: React.FC<SignupPageProps> = () => {
  const [submitError, setSubmitError] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  ////* supabese redirect with params and we can see if an error ocurred
  const searchParams = useSearchParams();
  const codeExchangeError = useMemo(() => {
    if (!searchParams) return '';
    return searchParams.get('error_description');
  }, [searchParams]);

  // confirmation errors
  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx('bg-primary', {
        // conditional styles
        'bg-red-500/10': codeExchangeError,
        'border-red-500/50': codeExchangeError,
        'text-red-700': codeExchangeError,
      }),
    [codeExchangeError]
  );

  ////* Signup Form
  const form = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(SignupSchema),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSignup: SubmitHandler<FormData> = async ({ email, password }) => {
    const { error } = await actionSignUpUser({ email, password });
    if (error) {
      setSubmitError(error.message);
      return form.reset();
    }
    setEmailConfirmationSent(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSignup)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        {/* ====== Logo ====== */}
        <Link href="/" className="w-full flex justify-left items-center">
          <Image src={LOGO} alt="cypress Logo" width={50} height={50} />
          <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
            cypress.
          </span>
        </Link>

        {/* ====== Desc ====== */}
        <FormDescription className="text-foreground/60">
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>

        {/* ====== Actual form - NO confirm ====== */}
        {!emailConfirmationSent && !codeExchangeError && (
          <>
            {/* ====== Inputs ====== */}
            <FormField
              disabled={isSubmitting}
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Password --- */}
            <FormField
              disabled={isSubmitting}
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Password Confirmation --- */}
            <FormField
              disabled={isSubmitting}
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full p-6"
              disabled={isSubmitting}
            >
              {!isSubmitting ? 'Create Account' : <Loader />}
            </Button>
          </>
        )}

        {submitError && <FormMessage>{submitError}</FormMessage>}

        {/* --- nav --- */}
        <span className="self-container">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </span>

        {/* ====== Comfirmed: email sent ====== */}
        {(emailConfirmationSent || codeExchangeError) && (
          <Alert className={confirmationAndErrorStyles}>
            {!codeExchangeError && <MailCheck className="h-4 w-4" />}
            <AlertTitle>
              {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
            </AlertTitle>
            <AlertDescription>
              {codeExchangeError || 'An email confirmation has been sent.'}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
};

export default SignupPage;

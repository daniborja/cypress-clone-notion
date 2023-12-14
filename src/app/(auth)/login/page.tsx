'use client'; // router & react hooks

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // v.13+
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import LOGO from '../../../../public/cypresslogo.svg';

import { Loader } from '@/components/shared';
import { Button } from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoginSchema } from '@/lib/helpers';
import { actionLoginUser } from '@/lib/server-actions';

export type LoginPageProps = {};

type FormData = {
  email: string;
  password: string;
};

const LoginPage: React.FC<LoginPageProps> = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  ///* Login Form
  const form = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      // email: 'alex@test.com',
      // password: '123123',
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onLogin: SubmitHandler<FormData> = async formData => {
    const { error } = await actionLoginUser(formData);
    if (error) {
      reset();
      return setSubmitError(error.message);
    }

    router.replace('/dashboard'); // can't return
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onLogin)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        {/* ====== Logo ====== */}
        <Link href="/" className="w-full flex justify-left items-center">
          <Image src={LOGO} alt="cypress Logo" width={50} height={50} />
          <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
            cypress.
          </span>
        </Link>

        <FormDescription className="text-foreground/60">
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>

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
        {/* Password */}
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
        {submitError && <FormMessage>{submitError}</FormMessage>}

        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isSubmitting}
        >
          {!isSubmitting ? 'Login' : <Loader />}
        </Button>

        <span className="self-container">
          Dont have an account?{' '}
          <Link href="/signup" className="text-primary">
            Sign Up
          </Link>
        </span>
      </form>
    </Form>
  );
};

export default LoginPage;

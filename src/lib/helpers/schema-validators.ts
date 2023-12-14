import { z } from 'zod';

////* Auth
export const LoginSchema = z.object({
  email: z.string().describe('Email').email({ message: 'Invalid Email' }),
  password: z.string().describe('Password').min(1, 'Password is required'),
});

export const SignupSchema = z
  .object({
    email: z.string().describe('Email').email({ message: 'Invalid Email' }),
    password: z
      .string()
      .describe('Password')
      .min(6, 'Password must be minimum 6 characters'),
    confirmPassword: z
      .string()
      .describe('Confirm Password')
      .min(6, 'Password must be minimum 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    // if not
    message: "Passwords don't match.",
    path: ['confirmPassword'], // set error to confirmPassword
  });

////* Workspace
export const CreateWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .describe('Workspace Name')
    .min(1, 'Workspace name must be min of 1 character'),
  logo: z.any(),
});

////* Quill Editor
// Banner Uploader
export const UploadBannerFormSchema = z.object({
  banner: z.string().describe('Banner Image'),
});

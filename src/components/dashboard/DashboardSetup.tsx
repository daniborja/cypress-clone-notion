'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import { CreateWorkspaceSchema } from '@/lib/helpers';
import { SupabaseStorage } from '@/lib/interfaces';
import { createWorkspace } from '@/lib/supabase/queries';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { EmojiPicker, Loader } from '../shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../ui';

export type DashboardSetupProps = {
  user: AuthUser;
  subscription: Subscription | null;
};

type FormData = {
  workspaceName: string;
  logo: any; // only for pro plan
};

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState('💼');

  const router = useRouter();

  ///* supabase storage (files)
  const supabase = createClientComponentClient();

  ///* Form
  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(CreateWorkspaceSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async formData => {
    const file = formData.logo?.[0];
    let filePath = null;
    const workspaceUUID = uuidv4();

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from(SupabaseStorage.logosBucket)
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
        if (error) throw new Error('');
        filePath = data.path;
      } catch (error) {
        console.log('Error', error);
        // toast({
        //   variant: 'destructive',
        //   title: 'Error! Could not upload your workspace logo',
        // });
      }
    }

    ////* Create workspace
    try {
      const newWorkspace: workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: selectedEmoji,
        id: workspaceUUID,
        inTrash: '',
        title: formData.workspaceName,
        workspaceOwner: user.id,
        logo: filePath || null,
        bannerUrl: '',
      };
      const { error: createError } = await createWorkspace(newWorkspace);
      if (createError) {
        throw new Error();
      }

      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, 'Error');
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>

      {/* ====== Card Content: Form ====== */}
      <CardContent>
        {/* html form to handle things with supabase */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {/* --- Workspace Name Input --- */}
            <div className="flex items-center gap-4">
              {/* Emoji picker */}
              <div className="text-5xl">
                <EmojiPicker getValue={emoji => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>

              {/* Label */}
              <div className="w-full ">
                <Label
                  htmlFor="workspaceName"
                  className="text-sm text-muted-foreground"
                >
                  Name
                </Label>

                {/* Workspace Name */}
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Workspace Name"
                  disabled={isSubmitting}
                  {...register('workspaceName', {
                    required: 'Workspace name is required',
                  })}
                />
                <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
              </div>
            </div>

            {/* --- Workspace Logo (pro plan) --- */}
            <div>
              <Label htmlFor="logo" className="text-sm text-muted-foreground">
                Workspace Logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Name"
                // disabled={isSubmitting || subscription?.status !== 'active'}
                {...register('logo', {
                  required: false,
                })}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
              {subscription?.status !== 'active' && (
                <small className="text-muted-foreground block">
                  To customize your workspace, you need to be on a Pro Plan
                </small>
              )}
            </div>

            {/* --- Submit btn --- */}
            <div className="self-end">
              <Button disabled={isSubmitting} type="submit">
                {!isSubmitting ? 'Create Workspace' : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;

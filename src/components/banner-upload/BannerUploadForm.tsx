'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubmitHandler, useForm } from 'react-hook-form';

import { UploadBannerFormSchema } from '@/lib/helpers';
import { useCypress } from '@/lib/hooks/useCypress';
import { WPDirType } from '@/lib/interfaces';
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { z } from 'zod';
import { Loader } from '../shared';
import { Button, Input, Label } from '../ui';

export type BannerUploadFormProps = {
  dirType: WPDirType;
  id: string;
};

const BannerUploadForm: React.FC<BannerUploadFormProps> = ({ dirType, id }) => {
  const supabase = createClientComponentClient();
  const {
    workspaceId,
    folderId,
    updateFile: updateFileContext,
    updateFolder: updateFolderContext,
    updateWorkspace: updateWorkspaceContext,
  } = useCypress();

  ///*  Form
  const form = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      banner: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = form;

  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async values => {
    const file = values.banner?.[0];
    if (!file || !id) return;

    try {
      let filePath = null;

      const uploadBanner = async () => {
        // todo: delete prev img and upload this one
        const { data, error } = await supabase.storage
          .from('file-banners')
          .upload(`banner-${id}`, file, { cacheControl: '5', upsert: true });
        if (error) throw new Error();
        filePath = data.path;
      };

      if (dirType === WPDirType.file) {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        updateFileContext({
          file: { bannerUrl: filePath },
          fileId: id,
          folderId,
          workspaceId,
        });
        await updateFile({ bannerUrl: filePath }, id);
      }

      if (dirType === WPDirType.folder) {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        updateFolderContext({
          folderId: id,
          folder: { bannerUrl: filePath },
          workspaceId,
        });
        await updateFolder({ bannerUrl: filePath }, id);
      }

      if (dirType === 'workspace') {
        if (!workspaceId) return;
        await uploadBanner();
        updateWorkspaceContext({
          workspace: { bannerUrl: filePath },
          workspaceId,
        });
        await updateWorkspace({ bannerUrl: filePath }, id);
      }
    } catch (error) {}
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-2"
    >
      {/* ------ Upload image ------ */}
      <Label className="text-sm text-muted-foreground" htmlFor="bannerImage">
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isSubmitting}
        {...register('banner', { required: 'Banner Image is required' })}
      />
      <small className="text-red-600">
        {errors.banner?.message?.toString()}
      </small>

      {/* ------ submit btn ------ */}
      <Button disabled={isSubmitting} type="submit">
        {!isSubmitting ? 'Upload Banner' : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadForm;

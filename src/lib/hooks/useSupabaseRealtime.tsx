import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { File } from '../supabase/supabase.types';
import { useCypress } from './useCypress';

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const {
    state,
    workspaceId: selectedWorskpace,
    addFile: addFileContext,
    deleteFile: deleteFileContext,
    updateFile: updateFileContext,
  } = useCypress();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        // all events in postgres public schema
        { event: '*', schema: 'public', table: 'files' },

        async payload => {
          if (payload.eventType === 'INSERT') {
            console.log('🟢 RECEIVED REAL TIME EVENT');
            const {
              folder_id: folderId,
              workspace_id: workspaceId,
              id: fileId,
            } = payload.new;

            if (
              !state.workspaces
                .find(workspace => workspace.id === workspaceId)
                ?.folders.find(folder => folder.id === folderId)
                ?.files.find(file => file.id === fileId)
            ) {
              const newFile: File = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                folderId: payload.new.folder_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              };

              addFileContext({ file: newFile, folderId, workspaceId });
            }
          } else if (payload.eventType === 'DELETE') {
            let workspaceId = '';
            let folderId = '';

            const fileExists = state.workspaces.some(workspace =>
              workspace.folders.some(folder =>
                folder.files.some(file => {
                  if (file.id === payload.old.id) {
                    workspaceId = workspace.id;
                    folderId = folder.id;
                    return true;
                  }
                })
              )
            );

            if (fileExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              deleteFileContext({
                fileId: payload.old.id,
                folderId,
                workspaceId,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const { folder_id: folderId, workspace_id: workspaceId } =
              payload.new;

            state.workspaces.some(workspace =>
              workspace.folders.some(folder =>
                folder.files.some(file => {
                  if (file.id === payload.new.id) {
                    updateFileContext({
                      workspaceId,
                      folderId,
                      fileId: payload.new.id,
                      file: {
                        title: payload.new.title,
                        iconId: payload.new.icon_id,
                        inTrash: payload.new.in_trash,
                      },
                    });
                    return true;
                  }
                })
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [
    supabase,
    state,
    selectedWorskpace,
    addFileContext,
    router,
    deleteFileContext,
    updateFileContext,
  ]);

  return null;
};

export default useSupabaseRealtime;

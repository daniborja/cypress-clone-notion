'use client';

import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSubscriptionModal } from '@/lib/context/ui/subscription-modal-provider';
import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import useSupabaseRealtime from '@/lib/hooks/useSupabaseRealtime';
import { WPListType } from '@/lib/interfaces';
import { createFolder } from '@/lib/supabase/queries';
import { Folder } from '@/lib/supabase/supabase.types';
import { TooltipComponent } from '../shared';
import { Accordion } from '../ui/accordion';
import { useToast } from '../ui/use-toast';
import Dropdown from './Dropdown';

export type FoldersDropdownListProps = {
  workspaceFolders: Folder[];
  workspaceId: string;
};

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  useSupabaseRealtime();

  const {
    state,
    folderId,
    setFolders: setFoldersContext,
    addFolder,
  } = useCypress();
  const { setOpen } = useSubscriptionModal();
  const { toast } = useToast();
  const { subscription } = useAuthUser();

  const [folders, setFolders] = useState(workspaceFolders);

  ////* real time upds

  ////* effec set initial state in ContextProvider
  useEffect(() => {
    if (workspaceFolders.length > 0)
      setFoldersContext({ workspaceId, workspaceFolders });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceFolders, workspaceId]);

  // upd local state (component)
  useEffect(() => {
    setFolders(
      state.workspaces.find(workspace => workspace.id === workspaceId)
        ?.folders || []
    );
  }, [state, workspaceId]);

  ////* local state folders

  ////* add folder

  ////* handlers
  const addFolderHandler = async () => {
    if (folders.length >= 3 && !subscription) return setOpen(true);

    // create folder
    const newFolder: Folder = {
      data: null,
      id: uuidv4(), // folderId
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📁',
      inTrash: null,
      workspaceId,
      bannerUrl: '',
    };

    // add folder to ContextProvider
    addFolder({ workspaceId, newFolder });

    // save folder in Db
    const { error } = await createFolder(newFolder);
    if (error)
      return toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not create the folder',
      });

    toast({
      title: 'Success',
      description: 'Created folder.',
    });
  };

  return (
    <>
      {/* ========= Folders ========= */}
      <div className="flex sticky z-20 top-0 bg-background w-full  h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8">
        {/* --- label --- */}
        <span className="text-Neutrals-8 font-bold text-xs">FOLDERS</span>

        {/* --- tooltip --- */}
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>

      {/* ========= Accordion ========= */}
      <Accordion
        type="multiple"
        defaultValue={[folderId || '']}
        className="pb-20"
      >
        {folders
          .filter(folder => !folder.inTrash)
          .map(folder => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType={WPListType.folder}
              id={folder.id}
              iconId={folder.iconId}
            />
          ))}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;

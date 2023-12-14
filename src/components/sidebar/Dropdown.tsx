'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import clsx from 'clsx';
import { PlusIcon, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import { WPListType } from '@/lib/interfaces';
import { createFile, updateFile, updateFolder } from '@/lib/supabase/queries';
import { File } from '@/lib/supabase/supabase.types';
import { EmojiPicker, TooltipComponent } from '../shared';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { useToast } from '../ui/use-toast';

export type DropdownProps = {
  title: string;
  id: string;
  listType: WPListType.folder | WPListType.file;
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  ...props
}) => {
  createClientComponentClient();
  const router = useRouter();

  const { toast } = useToast();
  const { user } = useAuthUser();
  const {
    state,
    workspaceId,
    folderId,
    updateFolder: updateFolderContext,
    updateFile: updateFileContext,
    addFile,
  } = useCypress();
  const [isEditing, setIsEditing] = useState(false);

  ///* avoid hydratation error (Trigger is a btn)
  // const [isMounted, setIsMounted] = useState(false);
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  ////* Folder Title Synchronized with server data and local
  const folderTitle: string | undefined = useMemo(() => {
    if (listType === WPListType.folder) {
      const stateTitle = state.workspaces
        .find(workspace => workspace.id === workspaceId)
        ?.folders.find(folder => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  ////* fileItitle
  const fileTitle: string | undefined = useMemo(() => {
    if (listType === WPListType.file) {
      const fileAndFolderId = id.split(WPListType.folder);
      const stateTitle = state.workspaces
        .find(workspace => workspace.id === workspaceId)
        ?.folders.find(folder => folder.id === fileAndFolderId[0])
        ?.files.find(file => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  ////* navigate to a != page
  const navigatatePage = (accordionId: string, type: string) => {
    if (type === WPListType.folder) {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === WPListType.file) {
      router.push(
        `/dashboard/${workspaceId}/${folderId}/${
          accordionId.split(WPListType.folder)[1]
        }`
      );
    }
  };

  ////* handlers
  // allow to upd folder title
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // upd folder title after losing the blur, after doubleClick
  const handleBlur = async () => {
    if (!isEditing) return;

    setIsEditing(false);
    const fId = id.split(WPListType.folder);
    if (fId?.length === 1) {
      if (!folderTitle) return;
      toast({
        title: 'Success',
        description: 'Folder title changed.',
      });
      await updateFolder({ title }, fId[0]);
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return;

      const { error } = await updateFile({ title: fileTitle }, fId[1]);
      if (error)
        return toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the title for this file',
        });

      toast({
        title: 'Success',
        description: 'File title changed.',
      });
    }
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;

    if (listType === WPListType.folder) {
      updateFolderContext({
        workspaceId,
        folderId: id,
        folder: { iconId: selectedEmoji },
      });

      const { error } = await updateFolder({ iconId: selectedEmoji }, id);
      if (error)
        return toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the emoji for this folder',
        });

      toast({
        title: 'Success',
        description: 'Update emoji for the folder',
      });
    }
  };

  const folderTitleChange = (e: any) => {
    if (!workspaceId) return;

    const fid = id.split(WPListType.folder);
    if (fid.length === 1) {
      updateFolderContext({
        folder: { title: e.target.value },
        folderId: fid[0],
        workspaceId,
      });
    }
  };

  const fileTitleChange = (e: any) => {
    if (!workspaceId || !folderId) return;

    const fid = id.split(WPListType.folder);
    if (fid.length === 2 && fid[1]) {
      updateFileContext({
        file: { title: e.target.value },
        folderId,
        workspaceId,
        fileId: fid[1],
      });
    }
  };

  const addNewFile = async () => {
    if (!workspaceId) return;

    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: 'Untitled',
      iconId: '📄',
      id: uuidv4(),
      workspaceId,
      bannerUrl: '',
    };
    addFile({ file: newFile, folderId: id, workspaceId });

    const { error } = await createFile(newFile);
    if (error)
      return toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not create a file',
      });

    toast({
      title: 'Success',
      description: 'File created.',
    });
  };

  // move to trash
  const moveToTrash = async () => {
    if (!user?.email || !workspaceId) return;

    const pathId = id.split(WPListType.folder);
    if (listType === WPListType.folder) {
      updateFolderContext({
        folder: { inTrash: `Deleted by ${user?.email}` },
        folderId: pathId[0],
        workspaceId,
      });
      const { error } = await updateFolder(
        { inTrash: `Deleted by ${user?.email}` },
        pathId[0]
      );
      if (error)
        return toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the folder to trash',
        });

      toast({
        title: 'Success',
        description: 'Moved folder to trash',
      });
    }

    if (listType === WPListType.file) {
      updateFileContext({
        file: { inTrash: `Deleted by ${user?.email}` },
        folderId: pathId[0],
        workspaceId,
        fileId: pathId[1],
      });

      const { error } = await updateFile(
        { inTrash: `Deleted by ${user?.email}` },
        pathId[1]
      );
      if (error)
        return toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the folder to trash',
        });

      toast({
        title: 'Success',
        description: 'Moved folder to trash',
      });
    }
  };

  ////* styles & identifiers
  const isFolder = listType === WPListType.folder;
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    {
      'group/folder': isFolder,
      'group/file': !isFolder,
    }
  );

  const listStyles = useMemo(
    () =>
      clsx('relative', {
        'border-none text-md': isFolder,
        'border-none ml-6 text-[16px] py-1': !isFolder,
      }),
    [isFolder]
  );

  const hoverStyles = useMemo(
    () =>
      clsx(
        'h-full hidden rounded-sm absolute right-0 items-center justify-center',
        {
          'group-hover/file:block': listType === WPListType.file,
          'group-hover/folder:block': listType === WPListType.folder,
        }
      ),
    [listType]
  );

  // avoid hydratation error - fixed in accordion shadcn component
  // if (!isMounted) return null;

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={e => {
        e.stopPropagation();
        navigatatePage(id, listType);
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm"
        disabled={listType === WPListType.file}
      >
        {/* <div className="hover:no-underline p-2 dark:text-muted-foreground text-sm"> */}
        <div className={groupIdentifies}>
          <div className="flex gap-4 items-center justify-center overflow-hidden">
            <div className="relative">
              <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
            </div>

            <input
              type="text"
              value={listType === WPListType.folder ? folderTitle : fileTitle}
              className={clsx(
                'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
                {
                  'bg-muted cursor-text': isEditing,
                  'bg-transparent cursor-pointer': !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === WPListType.folder
                  ? folderTitleChange
                  : fileTitleChange
              }
            />
          </div>

          <div className={hoverStyles}>
            <TooltipComponent
              message={`Delete ${
                listType === WPListType.folder ? 'Folder' : 'File'
              }`}
            >
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </TooltipComponent>
            {listType === WPListType.folder && !isEditing && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
        {/* </div> */}
      </AccordionTrigger>

      {/* ========== Content ========== */}
      <AccordionContent>
        {state.workspaces
          .find(workspace => workspace.id === workspaceId)
          ?.folders.find(folder => folder.id === id)
          ?.files.filter(file => !file.inTrash)
          .map(file => {
            const customFileId = `${id}folder${file.id}`;
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType={WPListType.file}
                id={customFileId}
                iconId={file.iconId}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
};

export default Dropdown;

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { XCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// quill styles - theme
import 'quill/dist/quill.snow.css';

import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import { useSocket } from '@/lib/hooks/useSocket';
import { SupabaseStorage, WPDirType } from '@/lib/interfaces';
import {
  deleteFile,
  deleteFolder,
  findUser,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import BannerUpload from '../banner-upload/BannerUpload';
import { EmojiPicker } from '../shared';
import { Avatar, AvatarFallback, AvatarImage, Button } from '../ui';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export type QuillEditorProps = {
  dirDetails: File | Folder | workspace;
  fileId: string; // id of fetched data
  dirType: WPDirType;
};

/////* Toolbar Opts - custom module in QuillEditor
var TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  fileId,
  dirType,
  dirDetails,
}) => {
  const supabase = createClientComponentClient();
  const {
    state,
    workspaceId,
    folderId,
    updateFile: updateFileContext,
    updateFolder: updateFolderContext,
    deleteFile: deleteFileContext,
    deleteFolder: deleteFolderContext,
    updateWorkspace: updateWorkspaceContext,
  } = useCypress();
  const { user } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  ///* realtime with sockets
  const { socket, isConnected } = useSocket();

  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);

  // saving state like Google Docs
  const [saving, setSaving] = useState(false);

  // real tiem cursors like Google Docs
  const [localCursors, setLocalCursors] = useState<any>([]);

  ///* debouncer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  //////* Display Quill Editor
  const wrapperRef = useCallback(async (wrapper: any) => {
    // quill need window object
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = ''; // clear wrapper to avoid creating new editors each time

      const editor = document.createElement('div');
      wrapper.append(editor);

      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);

      const q = new Quill(editor, {
        theme: 'snow',
        // we can create custom component in Quill
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);

  //////* Fix caching probles (server & client)
  const details = useMemo(() => {
    // keep tracking to dir in contextprovider, if it does not exist, use server dir
    let selectedDir;
    if (dirType === WPDirType.file) {
      selectedDir = state.workspaces
        .find(workspace => workspace.id === workspaceId)
        ?.folders.find(folder => folder.id === folderId)
        ?.files.find(file => file.id === fileId);
    }
    if (dirType === WPDirType.folder) {
      selectedDir = state.workspaces
        .find(workspace => workspace.id === workspaceId)
        ?.folders.find(folder => folder.id === fileId);
    }
    if (dirType === WPDirType.workspace) {
      selectedDir = state.workspaces.find(workspace => workspace.id === fileId);
    }

    if (selectedDir) return selectedDir;

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as workspace | Folder | File;
  }, [dirType, dirDetails, state.workspaces, workspaceId, folderId, fileId]);

  //////* BreadCrumbs
  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;

    ///* Workspace BreadCrumb
    const segments = pathname
      .split('/')
      .filter(val => val !== 'dashboard' && val);

    const workspaceDetails = state.workspaces.find(
      workspace => workspace.id === workspaceId
    );

    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : '';

    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    ///* Folder BreadCrumb
    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      folder => folder.id === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : '';

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    }

    ///* File BreadCrumb
    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      file => file.id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : '';

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state, pathname, workspaceId]);

  //////* Effects
  /// realtime for QuillEditor (upd data and avoid outdated cached data)
  useEffect(() => {
    if (!fileId) return;

    const fetchInformation = async () => {
      if (dirType === WPDirType.file) {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) return router.replace('/dashboard');
        if (!selectedDir[0]) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }

        if (!workspaceId || quill === null) return;
        if (!selectedDir[0].data) return;

        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        updateFileContext({
          file: { data: selectedDir[0].data },
          fileId,
          folderId: selectedDir[0].folderId,
          workspaceId,
        });
      }

      if (dirType === WPDirType.folder) {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) return router.replace('/dashboard');

        if (!selectedDir[0]) router.replace(`/dashboard/${workspaceId}`);

        if (quill === null) return;
        if (!selectedDir[0].data) return;

        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        updateFolderContext({
          folderId: fileId,
          folder: { data: selectedDir[0].data },
          workspaceId: selectedDir[0].workspaceId,
        });
      }

      if (dirType === WPDirType.workspace) {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) return router.replace('/dashboard');

        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;

        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        updateWorkspaceContext({
          workspace: { data: selectedDir[0].data },
          workspaceId: fileId,
        });
      }
    };
    fetchInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, workspaceId, quill, dirType]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;

    const socketHandler = (range: any, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0].id === cursorId
        );
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };
    socket.on('receive-cursor-move', socketHandler);

    return () => {
      socket.off('receive-cursor-move', socketHandler);
    };
  }, [quill, socket, fileId, localCursors]);

  /// create rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  /// send quill changes to all clients - real time broadcast
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === 'user' && cursorId) {
          socket.emit('send-cursor-move', range, fileId, cursorId);
        }
      };
    };

    // quill changes handler
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return; // user that not made the change

      // debounce
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);

      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType == WPDirType.workspace) {
            updateWorkspaceContext({
              workspace: { data: JSON.stringify(contents) },
              workspaceId: fileId,
            });
            await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
          }

          if (dirType == WPDirType.folder) {
            if (!workspaceId) return;
            updateFolderContext({
              folder: { data: JSON.stringify(contents) },
              workspaceId,
              folderId: fileId,
            });
            await updateFolder({ data: JSON.stringify(contents) }, fileId);
          }

          if (dirType == WPDirType.file) {
            if (!workspaceId || !folderId) return;
            updateFileContext({
              file: { data: JSON.stringify(contents) },
              workspaceId,
              folderId: folderId,
              fileId,
            });
            await updateFile({ data: JSON.stringify(contents) }, fileId);
          }
        }

        setSaving(false);
      }, 850);

      socket.emit('send-changes', delta, fileId);
    };

    // socketio
    quill.on('text-change', quillHandler);
    quill.on('selection-change', selectionChangeHandler(user.id));

    return () => {
      quill.off('text-change', quillHandler);
      quill.off('selection-change', selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    quill,
    socket,
    fileId,
    user,
    details,
    folderId,
    workspaceId,
    dirType,
    updateWorkspaceContext,
    updateFolderContext,
    updateFileContext,
  ]);

  /// receive quill changes
  useEffect(() => {
    if (quill === null || socket === null) return;

    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };

    socket.on('receive-changes', socketHandler);

    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  /// collaborators real time (supabase)
  useEffect(() => {
    if (!fileId || quill === null) return;

    const room = supabase.channel(fileId);
    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);

        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { id: string; email: string; avatar: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule('cursors');
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split('@')[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                allCursors.push(userCursor);
              }
            }
          );

          setLocalCursors(allCursors);
        }
      })
      .subscribe(async status => {
        if (status !== 'SUBSCRIBED' || !user) return;
        const response = await findUser(user.id);
        if (!response) return;

        room.track({
          id: user.id,
          email: user.email?.split('@')[0],
          avatarUrl: response.avatarUrl
            ? supabase.storage
                .from(SupabaseStorage.avatarsBucket)
                .getPublicUrl(response.avatarUrl).data.publicUrl
            : '',
        });
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [fileId, quill, supabase, user]);

  //////* Handlers
  const restoreFileHandler = async () => {
    if (!workspaceId) return;

    if (dirType === WPDirType.file) {
      if (!folderId) return;
      updateFileContext({
        file: { inTrash: '' },
        fileId,
        folderId,
        workspaceId,
      });
      await updateFile({ inTrash: '' }, fileId);
    }

    if (dirType === WPDirType.folder) {
      updateFolderContext({
        folder: { inTrash: '' },
        folderId: fileId,
        workspaceId,
      });
      await updateFolder({ inTrash: '' }, fileId);
    }
  };

  const deleteFileHandler = async () => {
    if (!workspaceId) return;

    if (dirType === WPDirType.file) {
      if (!folderId) return;

      deleteFileContext({ fileId, folderId, workspaceId });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }

    if (dirType === WPDirType.folder) {
      deleteFolderContext({ folderId: fileId, workspaceId });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  const iconOnChange = async (icon: string) => {
    if (!fileId) return;

    if (dirType === WPDirType.workspace) {
      updateWorkspaceContext({
        workspace: { iconId: icon },
        workspaceId: fileId,
      });
      await updateWorkspace({ iconId: icon }, fileId);
    }

    if (dirType === WPDirType.folder) {
      if (!workspaceId) return;

      updateFolderContext({
        folder: { iconId: icon },
        workspaceId,
        folderId: fileId,
      });
      await updateFolder({ iconId: icon }, fileId);
    }

    if (dirType === WPDirType.file) {
      if (!workspaceId || !folderId) return;

      updateFileContext({
        file: { iconId: icon },
        workspaceId,
        folderId,
        fileId,
      });
      await updateFile({ iconId: icon }, fileId);
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);

    if (dirType === WPDirType.file) {
      if (!folderId || !workspaceId) return;
      updateFileContext({
        file: { bannerUrl: '' },
        fileId,
        folderId,
        workspaceId,
      });
      await supabase.storage
        .from(SupabaseStorage.bannersBucket)
        .remove([`banner-${fileId}`]);
      await updateFile({ bannerUrl: '' }, fileId);
    }

    if (dirType === WPDirType.folder) {
      if (!workspaceId) return;
      updateFolderContext({
        folder: { bannerUrl: '' },
        folderId: fileId,
        workspaceId,
      });
      await supabase.storage
        .from(SupabaseStorage.bannersBucket)
        .remove([`banner-${fileId}`]);
      await updateFolder({ bannerUrl: '' }, fileId);
    }

    if (dirType === WPDirType.workspace) {
      updateWorkspaceContext({
        workspace: { bannerUrl: '' },
        workspaceId: fileId,
      });
      await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
      await updateWorkspace({ bannerUrl: '' }, fileId);
    }

    setDeletingBanner(false);
  };

  return (
    <>
      <div className="relative">
        {/* ========== Restore / Trash ========== */}
        {details.inTrash && (
          <article className="py-2 z-40 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">
                This {dirType} is in the trash.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>

            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}

        {/* ========== BreadCrumbs & Status (saved/saving) ========== */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          {/* ------ BreadCrum ------ */}
          <div>{breadCrumbs}</div>

          {/* ------ Collaborators online ------ */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators?.map(collaborator => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                        <AvatarImage
                          src={
                            collaborator.avatarUrl ? collaborator.avatarUrl : ''
                          }
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* ------ doc status ------ */}
            {saving ? (
              <Badge
                variant="secondary"
                className="bg-orange-600 top-4 text-white right-4 z-50"
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-emerald-600 top-4 text-white right-4 z-50"
              >
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ========== Banner ========== */}
      {details.bannerUrl && (
        <div className="relative w-full h-[200px]">
          <Image
            src={
              supabase.storage
                .from(SupabaseStorage.bannersBucket)
                .getPublicUrl(details.bannerUrl).data.publicUrl
            }
            className="w-full md:h-48 h-20 object-cover unselectable"
            alt="Banner Image"
            fill
            draggable="false"
          />
        </div>
      )}

      {/* ========== Quill Editor ========== */}
      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div className="w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          {/* ------ Emoji Picker ------ */}
          <div className="text-[80px]">
            <EmojiPicker getValue={iconOnChange}>
              <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                {details.iconId}
              </div>
            </EmojiPicker>
          </div>

          {/* ------ Banner Uploader ------ */}
          <div className="flex">
            <BannerUpload
              id={fileId}
              dirType={dirType}
              className="mt-2 text-sm text-muted-foreground p-2 hover:text-card-foreground transition-all rounded-md"
            >
              {details.bannerUrl ? 'Update Banner' : 'Add Banner'}
            </BannerUpload>

            {details.bannerUrl && (
              <Button
                disabled={deletingBanner}
                onClick={deleteBanner}
                variant="ghost"
                className="gap-2 hover:bg-background flex item-center justify-center mt-2 text-sm text-muted-foreground w-36 p-2 rounded-md"
              >
                <XCircleIcon size={16} />
                <span className="whitespace-nowrap font-normal">
                  Remove Banner
                </span>
              </Button>
            )}
          </div>

          {/* ------ Some details ------ */}
          <span className="text-muted-foreground text-3xl font-bold h-9 mt-5 mb-3">
            {details.title}
          </span>
          <span className="text-muted-foreground text-sm">
            {dirType.toUpperCase()}
          </span>
        </div>

        {/* ======= Quill Editor ======= */}
        <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
      </div>
    </>
  );
};

export default QuillEditor;

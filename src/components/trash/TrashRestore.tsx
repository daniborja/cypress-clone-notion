'use client';

import { useEffect, useState } from 'react';

import { AppFoldersType } from '@/lib/context/cypress/CypressProvider';
import { useCypress } from '@/lib/hooks/useCypress';
import { File } from '@/lib/supabase/supabase.types';
import { FileIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';

export type TrashRestoreProps = {};

const TrashRestore: React.FC<TrashRestoreProps> = () => {
  const { state, workspaceId } = useCypress();
  const [folders, setFolders] = useState<AppFoldersType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);

  ////* s
  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find(workspace => workspace.id === workspaceId)
        ?.folders.filter(folder => folder.inTrash) || [];
    setFolders(stateFolders);

    let stateFiles: File[] = [];
    state.workspaces
      .find(workspace => workspace.id === workspaceId)
      ?.folders.forEach(folder => {
        folder.files.forEach(file => {
          if (file.inTrash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state, workspaceId]);

  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map(folder => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex item-center justify-between"
              href={`/dashboard/${folder.workspaceId}/${folder.id}`}
              key={folder.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FolderIcon />
                  {folder.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}

      {!!files.length && (
        <>
          <h3>Files</h3>
          {files.map(file => (
            <Link
              key={file.id}
              className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {file.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}

      {!files.length && !folders.length && (
        <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          No Items in trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;

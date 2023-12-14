import { WorkspaceDropdownProps } from '@/components/sidebar/WorkspaceDropdown';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import { AppFoldersType, AppWorkspacesType } from './CypressProvider';

// https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys
export type SetMyWorkspacesProps = Pick<
  WorkspaceDropdownProps,
  'privateWorkspaces' | 'sharedWorkspaces' | 'collaboratingWorkspaces'
>;

export type SetWorkspaceProps = {
  workspaces: any[];
};

export type UpdateWorkspaceProps = {
  workspace: Partial<AppWorkspacesType>;
  workspaceId: string;
};

export type AddFolderProps = {
  workspaceId: string;
  newFolder: Folder;
};

export type UpdateFolderProps = {
  folder: Partial<AppFoldersType>;
  folderId: string;
  workspaceId: string;
};

export type DeleteFolderProps = { workspaceId: string; folderId: string };

export type AddFileProps = {
  workspaceId: string;
  file: File;
  folderId: string;
};

export type UpdateFileProps = {
  file: Partial<File>;
  folderId: string;
  workspaceId: string;
  fileId: string;
};

export type DeleteFileProps = {
  workspaceId: string;
  folderId: string;
  fileId: string;
};

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

import {
  getCollaboratingWorkspaces,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { NativeNavigation, PlanUsage } from '.';
import { ScrollArea } from '../ui/scroll-area';
import FoldersDropdownList from './FoldersDropdownList';
import WorkspaceDropdown from './WorkspaceDropdown';

export type SidebarProps = {
  params: { workspaceId: string };
  className?: string;
};

////* Server Components can be Async
const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
  const supabase = createServerComponentClient({ cookies });

  ///* user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  ///* subscription
  const { data: subscriptionData, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  ///* folders
  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    params.workspaceId
  );

  ///* error
  if (subscriptionError || foldersError) redirect('/dashboard');

  ///* get all the != workspaces: private, collaborating & shared
  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ]);

  return (
    <aside
      className={twMerge(
        'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
        className
      )}
    >
      <div>
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          // selectedOption
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find(workspace => workspace.id === params.workspaceId)}
        />

        <PlanUsage
          foldersLength={workspaceFolderData?.length || 0}
          subscription={subscriptionData}
        />

        <NativeNavigation myWorkspaceId={params.workspaceId} />

        {/* ========= Dropdown ========= */}
        <ScrollArea className="overflow-auto custom-scrollbar relative h-[450px]">
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />

          <FoldersDropdownList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={params.workspaceId}
          />
        </ScrollArea>
      </div>
    </aside>
  );
};

export default Sidebar;

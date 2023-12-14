import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic'; // works with quill

import QuillEditor from '@/components/quill-editor/QuillEditor';
import { WPDirType } from '@/lib/interfaces';
import { getWorkspaceDetails } from '@/lib/supabase/queries';

export type WorkspacePageProps = {
  params: { workspaceId: string };
};

////* Server Components can be Async to fetch data
const WorkspacePage: React.FC<WorkspacePageProps> = async ({ params }) => {
  const { data, error } = await getWorkspaceDetails(params.workspaceId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative">
      <QuillEditor
        dirType={WPDirType.workspace}
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default WorkspacePage;

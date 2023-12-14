export const dynamic = 'force-dynamic'; // works with quill

import QuillEditor from '@/components/quill-editor/QuillEditor';
import { WPDirType } from '@/lib/interfaces';
import { getFolderDetails } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

export type FolderProps = {
  params: { folderId: string };
};

const FolderPage: React.FC<FolderProps> = async ({ params }) => {
  const { data, error } = await getFolderDetails(params.folderId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative ">
      <QuillEditor
        dirType={WPDirType.folder}
        fileId={params.folderId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default FolderPage;

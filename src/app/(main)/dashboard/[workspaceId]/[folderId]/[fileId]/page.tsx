export const dynamic = 'force-dynamic'; // works with quill

import { redirect } from 'next/navigation';

import QuillEditor from '@/components/quill-editor/QuillEditor';
import { WPDirType } from '@/lib/interfaces';
import { getFileDetails } from '@/lib/supabase/queries';

export type FilePageProps = {
  params: { fileId: string };
};

const FilePage: React.FC<FilePageProps> = async ({ params }) => {
  const { data, error } = await getFileDetails(params.fileId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative">
      <QuillEditor
        dirType={WPDirType.file}
        fileId={params.fileId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default FilePage;

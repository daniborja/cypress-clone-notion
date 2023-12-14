'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SupabaseStorage } from '@/lib/interfaces';
import { workspace } from '@/lib/supabase/supabase.types';

export type SelectedWorkspaceProps = {
  workspace: workspace;
  onClick?: (option: workspace) => void;
};

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
  workspace,
  onClick,
}) => {
  const supabase = createClientComponentClient();
  const [workspaceLogo, setWorkspaceLogo] = useState('/cypresslogo.svg');

  useEffect(() => {
    if (workspace?.logo) {
      const logoPath = supabase.storage
        .from(SupabaseStorage.logosBucket)
        .getPublicUrl(workspace.logo)?.data.publicUrl;

      setWorkspaceLogo(logoPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => {
        onClick && onClick(workspace);
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center cursor-pointer items-center my-2"
    >
      <Image
        src={workspaceLogo}
        alt="workspace logo"
        width={26}
        height={26}
        draggable="false"
      />

      <div className="flex flex-col">
        <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {workspace.title}
        </p>
      </div>
    </Link>
  );
};

export default SelectedWorkspace;

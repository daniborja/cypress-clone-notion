'use client';

import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import {
  CypressHomeIcon,
  CypressSettingsIcon,
  CypressTrashIcon,
} from '../icons';
import Settings from '../settings/Settings';
import Trash from '../trash/Trash';

export type NativeNavigationProps = {
  myWorkspaceId: string;
  className?: string;
};

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav className={twMerge('my-2', className)}>
      <ul className="flex flex-col gap-2 pb-2">
        <li>
          <Link
            className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>

        <Settings>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer">
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer">
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
};

export default NativeNavigation;

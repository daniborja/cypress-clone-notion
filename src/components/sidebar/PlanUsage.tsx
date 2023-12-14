'use client';

import { useEffect, useState } from 'react';

import { MAX_FOLDERS_FREE_PLAN } from '@/lib/constants/constants';
import { useCypress } from '@/lib/hooks/useCypress';
import { SubscriptionStatusEnum } from '@/lib/interfaces';
import { Subscription } from '@/lib/supabase/supabase.types';
import { CypressDiamondIcon } from '../icons';
import { Progress } from '../ui/progress';

export type PlanUsageProps = {
  foldersLength: number;
  subscription: Subscription | null;
};

const PlanUsage: React.FC<PlanUsageProps> = ({
  foldersLength,
  subscription,
}) => {
  const { workspaceId, state } = useCypress();
  const [usagePercentage, setUsagePercentage] = useState(
    (foldersLength / MAX_FOLDERS_FREE_PLAN) * 100
  );

  useEffect(() => {
    const stateFoldersLength = state.workspaces.find(
      workspace => workspace.id === workspaceId
    )?.folders.length;
    if (stateFoldersLength === undefined) return;

    setUsagePercentage((stateFoldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
  }, [state, workspaceId]);

  return (
    <article className="mb-5">
      {/* ====== Free plan ====== */}
      {subscription?.status !== SubscriptionStatusEnum.active && (
        <div className="flex gap-2 text-muted-foreground mb-2 items-center">
          <div className="h-4 w-4">
            <CypressDiamondIcon />
          </div>

          {/* --- Free plan percentage --- */}
          <div className="flex justify-between w-full items-center">
            <div>Free Plan</div>
            <small>{usagePercentage.toFixed(0)}% / 100%</small>
          </div>
        </div>
      )}

      {/* --- Progress bar --- */}
      {subscription?.status !== SubscriptionStatusEnum.active && (
        <Progress value={usagePercentage} className="h-1" />
      )}
    </article>
  );
};

export default PlanUsage;

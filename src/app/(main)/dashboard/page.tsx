import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardSetup } from '@/components/dashboard';
import db from '@/lib/supabase/db';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';

export type DashboardPageProps = {};

/////* Server Components can be Async
const DashboardPage: React.FC<DashboardPageProps> = async () => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  ////* validate if the auth user already has a workspace
  const workspace = await db.query.workspaces.findFirst({
    // eq = equal that return a boolean
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  });

  ///* validate subscription
  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);
  if (subscriptionError) return;

  if (!workspace)
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup user={user} subscription={subscription} />
      </div>
    );

  // if you have one, redirect to it
  redirect(`/dashboard/${workspace.id}`);
};

export default DashboardPage;

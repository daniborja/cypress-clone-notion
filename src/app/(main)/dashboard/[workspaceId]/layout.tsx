import { Sidebar } from '@/components/sidebar';
import MobileSidebar from '@/components/sidebar/MobileSidebar';

export type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: any;
};

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  children,
  params,
}) => {
  return (
    <div className="flex overflow-hidden h-screen w-screen">
      <Sidebar params={params} />

      <MobileSidebar>
        <Sidebar params={params} className="w-screen inline-block sm:hidden" />
      </MobileSidebar>

      <div className="dark:boder-Neutrals-12/70 border-l-[1px] w-full relative overflow-scroll">
        {children}
      </div>
    </div>
  );
};

export default WorkspaceLayout;

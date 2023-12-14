import { SubscriptionModalProvider } from '@/lib/context/ui/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';

export type MainLayoutProps = {
  children: React.ReactNode;
  params: any;
};

const MainLayout: React.FC<MainLayoutProps> = async ({ children }) => {
  const { data: products, error } = await getActiveProductsWithPrice();
  if (error) throw new Error();

  return (
    <main className="flex over-hidden h-screen">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default MainLayout;

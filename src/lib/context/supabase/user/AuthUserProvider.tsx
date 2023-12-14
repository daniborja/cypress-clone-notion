'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { Subscription } from '@/lib/supabase/supabase.types';
import { AuthUserContext } from './AuthUserContext';

export interface AuthUserState {
  user: AuthUser | null;
  subscription: Subscription | null;
}

interface AuthUserProviderProps {
  children: React.ReactNode;
}

export const AuthUserProvider = ({ children }: AuthUserProviderProps) => {
  const [user, setUser] = useState<AuthUserState['user']>(null);
  const [subscription, setSubscription] =
    useState<AuthUserState['subscription']>(null);

  const { toast } = useToast();

  const supabase = createClientComponentClient();

  ///* set AuthUserData to ContextProvider
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data, error } = await getUserSubscriptionStatus(user.id);
      data && setSubscription(data);

      error &&
        toast({
          title: 'Unexpected Error',
          description: 'Oppse! An unexpected error happened. Try again later.',
        });
    };
    getUser();
  }, [supabase.auth, toast]);

  return (
    <AuthUserContext.Provider value={{ user, subscription }}>
      {children}
    </AuthUserContext.Provider>
  );
};

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import { Button } from '../ui/button';

interface LogoutButtonProps {
  children: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children }) => {
  useAuthUser();
  const { setWorkspaces } = useCypress();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setWorkspaces({ workspaces: [] });
  };

  return (
    <Button variant="ghost" size="icon" className="p-0" onClick={logout}>
      {children}
    </Button>
  );
};

export default LogoutButton;

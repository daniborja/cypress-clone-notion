import { AuthUser } from '@supabase/supabase-js';
import { createContext } from 'react';

import { Subscription } from '@/lib/supabase/supabase.types';

interface AuthUserContextProps {
  user: AuthUser | null;
  subscription: Subscription | null;
}

export const AuthUserContext = createContext({} as AuthUserContextProps);

'use client';

import { useContext } from 'react';

import { AuthUserContext } from '../context/supabase/user/AuthUserContext';

export const useAuthUser = () => useContext(AuthUserContext);

'use client';

import { createContext } from 'react';

interface SocketContextProps {
  socket: any | null;
  isConnected: boolean;
}

export const SocketContext = createContext({} as SocketContextProps);

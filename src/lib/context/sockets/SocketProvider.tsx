'use client';

import { useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';

import { SocketContext } from './SocketContext';

export interface SocketState {
  socket: any | null;
  isConnected: boolean;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketState['socket']>(null);
  const [isConnected, setIsConnected] =
    useState<SocketState['isConnected']>(false);

  /////* setup socketio
  useEffect(() => {
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: '/api/socket/io',
        addTrailingSlash: false,
      }
    );

    ////* listeners
    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

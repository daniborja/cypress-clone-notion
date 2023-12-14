'use client';

import { useContext } from 'react';

import { SocketContext } from '../context/sockets/SocketContext';

export const useSocket = () => useContext(SocketContext);

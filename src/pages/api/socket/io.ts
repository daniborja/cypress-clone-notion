import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

import { NextApiResponseServerIO } from '@/lib/interfaces';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server as any;

    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

    ///* connection & events
    io.on('connection', s => {
      s.on('create-room', fileId => {
        s.join(fileId);
      });

      s.on('send-changes', (deltas, fileId) => {
        console.log('CHANGE');
        s.to(fileId).emit('receive-changes', deltas, fileId);
      });

      s.on('send-cursor-move', (range, fileId, cursorId) => {
        s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import config from './app/config';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { Server } from 'socket.io';
import http from 'http';
import { User } from './app/modules/User/user.model';
import { USER_ROLE } from './app/modules/User/user.constant';
import { sendNotification } from './app/modules/AppSystem/Constants/updateRank';

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  path: '/socket.io',
  pingTimeout: 60000,
  cors: {
    origin: [config.origin_link as string],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [config.origin_link as string], credentials: true }));

// --- Routes ---
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(`
    <h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
  `);
});

// --- Error Handling ---
app.use(globalErrorHandler);
app.use(notFound);

// --- Active Users System ---
const users = new Map<string, string>(); // userId -> socketId
let activeUsersChanged = false;

// Utility: Get active users
const getActiveUsers = () => {
  return Array.from(users.keys()).map((userId) => ({ userId }));
};

// Emit active users to clients
const emitActiveUsers = () => {
  if (!activeUsersChanged) return;
  const active = getActiveUsers();
  console.log('Emitting active users:', active);
  io.emit('activeUsers', active);
  activeUsersChanged = false;
};

// Debounce emit
const debounceEmitActiveUsers = (() => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(emitActiveUsers, 1000);
  };
})();

// --- Socket.IO Logic ---
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Log all events and their payloads
  const logEvent = (eventName: any) => {
    socket.on(eventName, (data: any) => {
      console.log(`Event: ${eventName}`);
      console.log(`Payload:`, data);
    });
  };

  // Known events to log
  const eventsToLog = ['setup', 'disconnect'];

  eventsToLog.forEach(logEvent);

  // Debug unknown events
  socket.onAny((event, ...args) => {
    if (
      !['setup', 'logout', 'disconnect', 'newInvest', 'newTicket'].includes(
        event,
      )
    ) {
      console.log(`Unhandled socket event: ${event}`, args);
    }
  });

  // Setup user
  socket.on('setup', (userData) => {
    if (!userData?._id) {
      console.log('Invalid setup payload');
      return;
    }

    //notification

    socket.on('new user', async (info) => {
      const users = await User.find({
        role: USER_ROLE.admin,
        _id: { $ne: info._id },
      });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket
          .in(user._id.toString())
          .emit('new user add message received', info);
      });
      await sendNotification(info)

      const data = {
        title: `congratulations!`,
        subTitle: `welcome to our home!`,
        user: userId,
        type: 'single',
      }
      socket.in(info._id).emit('congrats new user', data);
      await sendNotification(data)
    });

    socket.on('report', async (info) => {
      const users = await User.find({
        role: USER_ROLE.admin,
        _id: { $ne: info._id },
      });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket.in(user._id.toString()).emit('report received', info);
      });
      await sendNotification(info)
    });

    socket.on('new raffles', async (info) => {
      const users = await User.find({ _id: { $ne: info._id } });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket.in(user._id.toString()).emit('raffles message received', info);
      });
    });

    socket.on('get new tickets', async (info) => {
      const users = await User.find({ _id: { $ne: info._id } });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket.in(user._id.toString()).emit('ticket message received', info);
      });
    });

    socket.on('invest', async (info) => {
      const users = await User.find({ _id: { $ne: info._id } });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket
          .in(user._id.toString())
          .emit('new invest message received', info);
      });
    });

    socket.on('winner', async (info) => {
      const users = await User.find({ _id: { $ne: info._id } });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket.in(user._id.toString()).emit('winner message received', info);
      });
      const data =  {
        title: `congratulations on winning raffles!`,
        subTitle: `You have done a great job! we hope best wishes for you!`,
        user: userId,
        type: 'single',
      }
      socket.in(info._id).emit('congrats winner', data);
    });

    socket.on('join account', async (info) => {
      const users = await User.find({
        role: USER_ROLE.admin,
        _id: { $ne: info._id },
      });

      if (!info) {
        console.log('data is missing!');
        return;
      }
      users.forEach((user) => {
        socket
          .in(user._id.toString())
          .emit('new connected account message received', info);
      });

      const data = {
        title: `congratulations on your new stripe connection!`,
        subTitle: `welcome on your new connection with us! now you can withdraw money using connected account!s`,
        user: userId,
        type: 'single',
      }

      socket.in(info._id).emit('congrats on new stripe connector', data);
    });

    //noti finished

    const userId = userData._id;
    socket.data.userId = userId;
    socket.join(userId);
    users.set(userId, socket.id);

    activeUsersChanged = true;
    debounceEmitActiveUsers();

    console.log(`User setup complete: ${userId}`);
    socket.emit('connected');
  });

  socket.on(
    'newInvest',
    (investData: { _id: string; name: string; amount: number }) => {
      socket.emit('recentInvest', investData);
    },
  );

  socket.on(
    'newTicket',
    (ticketData: { _id: string; name: string; amount: number }) => {
      socket.emit('recentTicket', ticketData);
    },
  );

  // Handle logout
  socket.on('logout', () => {
    const userId = socket.data.userId;
    if (userId) {
      users.delete(userId);
      socket.leave(userId);

      activeUsersChanged = true;
      debounceEmitActiveUsers();
      console.log(`User logged out: ${userId}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId && users.get(userId) === socket.id) {
      users.delete(userId);
      activeUsersChanged = true;
      debounceEmitActiveUsers();
      console.log(`User disconnected: ${userId}`);
    }
  });
});

export { app, server, io };

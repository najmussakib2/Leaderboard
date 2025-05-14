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
    if (!['setup', 'logout', 'disconnect', "newInvest", 'newTicket'].includes(event)) {
      console.log(`Unhandled socket event: ${event}`, args);
    }
  });

  // Setup user
  socket.on('setup', (userData) => {
    if (!userData?._id) {
      console.log('Invalid setup payload');
      return;
    }

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

export { app, server };

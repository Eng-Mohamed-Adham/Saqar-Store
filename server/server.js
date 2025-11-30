// server/server.js
import { app } from './app.js'; 

import http from 'http';

import mongoose from 'mongoose';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


import connectDb from './config/dbConnect.js';
import { logEvents } from './middlewares/logger.js';
import './cronJobs.js';
import express from 'express';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDb();



const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});




// ✅ Static files الآن يمكن استخدامها
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'views')));

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 Socket Connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket Disconnected:', socket.id);
  });
});

// ✅ تشغيل السيرفر بعد الاتصال بـ Mongo
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});

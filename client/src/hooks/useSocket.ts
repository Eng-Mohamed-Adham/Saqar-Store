import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

export const useSocket = (shouldConnect: boolean): Socket | null => {
  const socketRef = useRef<Socket | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (shouldConnect && token && !socketRef.current) {
      const socket = io('http://localhost:5000', {
        transports: ['websocket'],
        auth: { token },
        withCredentials: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🟢 Socket connected');
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [shouldConnect, token]);

  return socketRef.current;
};

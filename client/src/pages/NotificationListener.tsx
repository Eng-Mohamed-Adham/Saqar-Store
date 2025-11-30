// pages/NotificationListener.tsx
import { useEffect } from 'react';
import { getSocket } from '../socket';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

const NotificationListener = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user || user.role !== 'seller') return;

    const socket = getSocket();

    socket.emit('join', user.id);

    const handleNewNotification = (data: any) => {
      console.log('📢 إشعار وارد:', data);
      toast.success(`🔔 ${data.message}`);
    };

    socket.off('newNotification'); // منع التكرار
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [user]);

  return null;
};

export default NotificationListener;

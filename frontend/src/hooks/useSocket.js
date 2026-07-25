import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (userId, onNotification) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);
    socketRef.current.emit('join', userId);

    socketRef.current.on('notification', (data) => {
      onNotification(data);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [userId]);
};

export default useSocket;
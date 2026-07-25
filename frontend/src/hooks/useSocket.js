import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (userId, onNotification) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to backend
    socketRef.current = io('http://localhost:5000');

    // Join personal room
    socketRef.current.emit('join', userId);

    // Listen for incoming notifications
    socketRef.current.on('notification', (data) => {
      console.log('Real-time notification received:', data);
      onNotification(data);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);
};

export default useSocket;
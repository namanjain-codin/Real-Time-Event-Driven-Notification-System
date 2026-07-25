import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  // Real-time: incoming notification via Socket.io
  useSocket(user?._id, (newNotification) => {
    setNotifications(prev => [
      { ...newNotification, isRead: false },
      ...prev
    ]);
    setUnreadCount(prev => prev + 1);
    toast.success(`${newNotification.title}: ${newNotification.message}`, {
      duration: 4000,
      position: 'top-right'
    });
  });

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#f44336',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '2px 5px',
            borderRadius: '10px',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '45px',
          width: '360px',
          maxHeight: '480px',
          overflowY: 'auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <strong>Notifications {unreadCount > 0 && `(${unreadCount})`}</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196F3',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ padding: '8px' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                No notifications yet
              </p>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n._id || n.notificationId}
                  notification={n}
                  onMarkRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
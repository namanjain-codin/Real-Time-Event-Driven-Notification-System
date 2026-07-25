const typeColors = {
  order: '#4CAF50',
  payment: '#f44336',
  promo: '#FF9800',
  system: '#2196F3'
};

const typeIcons = {
  order: '📦',
  payment: '💳',
  promo: '🎉',
  system: '⚙️'
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const color = typeColors[notification.type] || '#2196F3';
  const icon = typeIcons[notification.type] || '🔔';

  return (
    <div
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      style={{
        padding: '12px 16px',
        borderLeft: `4px solid ${color}`,
        background: notification.isRead ? '#fff' : '#f0f7ff',
        marginBottom: '8px',
        borderRadius: '4px',
        cursor: notification.isRead ? 'default' : 'pointer',
        transition: 'background 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '14px' }}>{notification.title}</strong>
            {!notification.isRead && (
              <span style={{
                background: '#2196F3',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>NEW</span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            {notification.message}
          </p>
          <span style={{ fontSize: '11px', color: '#999' }}>
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
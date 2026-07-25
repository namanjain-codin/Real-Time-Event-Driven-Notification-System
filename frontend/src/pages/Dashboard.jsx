import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const eventTypes = ['order', 'payment', 'promo', 'system'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    type: 'order',
    title: '',
    message: '',
    channels: ['in-app']
  });

  const handleChannelToggle = (channel) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications/publish', form);
      toast.success('Event published!');
      setForm({ type: 'order', title: '', message: '', channels: ['in-app'] });
    } catch (err) {
      toast.error('Failed to publish event');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Navbar */}
      <nav style={{
        background: 'white',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <strong style={{ fontSize: '18px' }}>🔔 Notification System</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#555' }}>Hi, {user?.name}</span>
          <NotificationBell />
          <button
            onClick={logout}
            style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0 }}>Publish a Notification Event</h2>
          <form onSubmit={handlePublish}>

            {/* Event Type */}
            <label style={styles.label}>Event Type</label>
            <select
              style={styles.input}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              {eventTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>

            {/* Title */}
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              placeholder="e.g. Order Confirmed"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />

            {/* Message */}
            <label style={styles.label}>Message</label>
            <textarea
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="e.g. Your order #1234 has been confirmed"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              required
            />

            {/* Channels */}
            <label style={styles.label}>Delivery Channels</label>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {['in-app', 'email'].map(channel => (
                <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.channels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                  />
                  {channel === 'in-app' ? '📱 In-App' : '📧 Email'}
                </label>
              ))}
            </div>

            <button type="submit" style={styles.button}>
              Publish Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }
};

export default Dashboard;
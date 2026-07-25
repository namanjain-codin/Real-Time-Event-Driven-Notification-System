import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const eventTypes = ['order', 'payment', 'promo', 'system'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const [form, setForm] = useState({
    type: 'order',
    title: '',
    message: '',
    channels: ['in-app'],
    targetUserId: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

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
      setForm({ type: 'order', title: '', message: '', channels: ['in-app'], targetUserId: '' });
    } catch (err) {
      toast.error('Failed to publish event');
    }
  };

  const toggleSimulator = async () => {
    try {
      if (simulatorRunning) {
        await api.post('/admin/simulate/stop');
        toast.success('Simulator stopped');
        setSimulatorRunning(false);
      } else {
        await api.post('/admin/simulate/start');
        toast.success('Simulator started — watch the bell!');
        setSimulatorRunning(true);
      }
    } catch (err) {
      toast.error('Failed to toggle simulator');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Navbar */}
      <nav style={{
        background: 'white', padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <strong style={{ fontSize: '18px' }}>🔔 Notification System</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#555' }}>Hi, {user?.name}</span>
          <NotificationBell />
          <button onClick={logout} style={styles.dangerBtn}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Simulator Card */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>⚡ Event Simulator</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            Auto-fires random notifications to random users every 8 seconds.
          </p>
          <button
            onClick={toggleSimulator}
            style={{
              ...styles.button,
              background: simulatorRunning ? '#f44336' : '#4CAF50'
            }}
          >
            {simulatorRunning ? '⏹ Stop Simulator' : '▶ Start Simulator'}
          </button>
        </div>

        {/* Publish Card */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>📤 Publish Notification</h3>
          <form onSubmit={handlePublish}>

            {/* Target User */}
            <label style={styles.label}>Send To</label>
            <select
              style={styles.input}
              value={form.targetUserId}
              onChange={e => setForm({ ...form, targetUserId: e.target.value })}
            >
              <option value="">Myself</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>

            {/* Event Type */}
            <label style={styles.label}>Event Type</label>
            <select style={styles.input} value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              {eventTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>

            {/* Title */}
            <label style={styles.label}>Title</label>
            <input style={styles.input} placeholder="e.g. Order Confirmed"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

            {/* Message */}
            <label style={styles.label}>Message</label>
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="e.g. Your order #1234 has been confirmed"
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />

            {/* Channels */}
            <label style={styles.label}>Delivery Channels</label>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {['in-app', 'email'].map(channel => (
                <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.channels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)} />
                  {channel === 'in-app' ? '📱 In-App' : '📧 Email'}
                </label>
              ))}
            </div>

            <button type="submit" style={styles.button}>Publish Event</button>
          </form>
        </div>

        {/* Admin Broadcast Card */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>📢 Admin Broadcast</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            Send a notification to all registered users simultaneously.
          </p>
          <BroadcastForm />
        </div>

      </div>
    </div>
  );
};

const BroadcastForm = () => {
  const [form, setForm] = useState({ type: 'system', title: '', message: '' });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/broadcast', { ...form, channels: ['in-app'] });
      toast.success(res.data.message);
      setForm({ type: 'system', title: '', message: '' });
    } catch (err) {
      toast.error('Broadcast failed');
    }
  };

  return (
    <form onSubmit={handleBroadcast}>
      <label style={styles.label}>Type</label>
      <select style={styles.input} value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}>
        {['order', 'payment', 'promo', 'system'].map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
      <label style={styles.label}>Title</label>
      <input style={styles.input} placeholder="e.g. Platform Maintenance"
        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
      <label style={styles.label}>Message</label>
      <textarea style={{ ...styles.input, height: '70px', resize: 'vertical' }}
        placeholder="e.g. We'll be down for 10 minutes at midnight"
        value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
      <button type="submit" style={{ ...styles.button, background: '#FF9800' }}>
        📢 Broadcast to All Users
      </button>
    </form>
  );
};

const styles = {
  card: { background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  dangerBtn: { background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }
};

export default Dashboard;
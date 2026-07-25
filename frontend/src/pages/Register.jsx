import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Name"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input style={styles.input} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={styles.button} type="submit">Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          Already have an account?{' '}
          <span style={{ color: '#2196F3', cursor: 'pointer' }} onClick={onSwitch}>Login</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px' },
  title: { textAlign: 'center', marginBottom: '24px', color: '#333' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: '#f44336', textAlign: 'center', marginBottom: '16px' }
};

export default Register;
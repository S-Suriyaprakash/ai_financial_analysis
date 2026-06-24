import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see where your money's been."
      footer={
        <>
          New to FinTrack? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@college.edu" required />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />
        {error && <div style={errorStyle}>{error}</div>}
        <button type="submit" disabled={loading} style={submitStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
      />
    </label>
  );
}

export const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-600)',
  letterSpacing: '0.3px',
  textTransform: 'uppercase',
};

export const inputStyle = {
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line)',
  background: '#fff',
  fontSize: '15px',
  color: 'var(--text-900)',
};

export const submitStyle = {
  marginTop: 8,
  padding: '13px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--ink-800)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '15px',
};

export const errorStyle = {
  background: 'var(--rust-soft)',
  color: 'var(--rust)',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '13px',
};

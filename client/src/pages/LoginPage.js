import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'litigant' || user.role === 'lawyer' ? '/cases' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="big-icon">⚖️</div>
        <h2>e-Portal for Case Management</h2>
        <p>A centralized digital platform for managing legal case hearings efficiently and securely.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-box">⚖️</div>
            <div><h1>e-Portal</h1><span>Case Management System</span></div>
          </div>
          <h2>Welcome Back</h2>
          <p className="auth-sub">Sign in to access your case portal</p>
          {error && <div className="error-msg">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
          <div className="auth-link">Don't have an account? <Link to="/register">Register here</Link></div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'litigant', phone: '', barRegistrationNo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/cases');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="big-icon">📋</div>
        <h2>Join the e-Portal</h2>
        <p>Register to file cases, track hearings, and manage legal documents — all in one place.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-box">⚖️</div>
            <div><h1>e-Portal</h1><span>Case Management System</span></div>
          </div>
          <h2>Create Account</h2>
          <p className="auth-sub">Fill in the details to get started</p>
          {error && <div className="error-msg">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="litigant">Litigant</option>
                <option value="lawyer">Lawyer / Advocate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            {form.role === 'lawyer' && (
              <div className="form-group">
                <label>Bar Registration No.</label>
                <input name="barRegistrationNo" value={form.barRegistrationNo} onChange={handleChange} placeholder="BAR/2024/12345" />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
          <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}

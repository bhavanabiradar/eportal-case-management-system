import React, { useEffect, useState } from 'react';
import axios from 'axios';

const roleColor = (r) => {
  const map = { admin: 'role-admin', judge: 'role-judge', lawyer: 'role-lawyer', litigant: 'role-litigant' };
  return map[r] || 'role-litigant';
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    await axios.put(`/api/users/${id}/toggle`);
    const r = await axios.get('/api/users');
    setUsers(r.data.users);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleStats = ['admin', 'judge', 'lawyer', 'litigant'].map(r => ({
    role: r, count: users.filter(u => u.role === r).length
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Role stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {roleStats.map(({ role, count }) => (
          <div key={role} className="stat-card">
            <span className="stat-label">{role}s</span>
            <span className="stat-value">{count}</span>
          </div>
        ))}
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value">{users.filter(u => u.isActive).length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="filters-bar">
        <input className="search-input" placeholder="Search by name, email, or role..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40 }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Bar No.</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--navy)', color: '#c9a84c',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td><span className={`role-badge ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: 12 }}>{u.barRegistrationNo || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: u.isActive ? 'var(--green)' : 'var(--red)'
                      }}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => toggleUser(u._id)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

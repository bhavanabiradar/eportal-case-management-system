import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0d2137','#1a3a5c','#c9a84c','#2a7d4f','#b83232','#1a5c9e'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{minHeight:'60vh'}}>Loading dashboard...</div>;

  const statusData = stats?.casesByStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const typeData = stats?.casesByType?.map(t => ({ name: t._id, count: t.count })) || [];

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon navy">⚖️</div>
          <div><div className="stat-value">{stats?.totalCases ?? 0}</div><div className="stat-label">Total Cases</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🗓️</div>
          <div><div className="stat-value">{stats?.totalHearings ?? 0}</div><div className="stat-label">Hearings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div><div className="stat-value">{stats?.todayHearings ?? 0}</div><div className="stat-label">Today's Hearings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📄</div>
          <div><div className="stat-value">{stats?.totalDocuments ?? 0}</div><div className="stat-label">Documents</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Cases by Status</span></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({name, value}) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{color:'var(--gray-400)'}}>No data yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Cases by Type</span></div>
          <div className="card-body" style={{ padding: '16px 0' }}>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--navy)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{color:'var(--gray-400)', padding:'0 24px'}}>No data yet</p>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Cases</span></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Case No.</th><th>Title</th><th>Filed By</th><th>Status</th></tr></thead>
              <tbody>
                {stats?.recentCases?.length > 0
                  ? stats.recentCases.map(c => (
                    <tr key={c._id}>
                      <td><code style={{fontSize:12}}>{c.caseNumber}</code></td>
                      <td style={{maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.title}</td>
                      <td>{c.filedBy?.name}</td>
                      <td><span className={`badge badge-${c.status.toLowerCase().replace(' ','-')}`}>{c.status}</span></td>
                    </tr>
                  ))
                  : <tr><td colSpan={4} style={{textAlign:'center', color:'var(--gray-400)', padding:24}}>No cases yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Upcoming Hearings</span></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Case</th><th>Purpose</th><th>Court</th></tr></thead>
              <tbody>
                {stats?.upcomingHearings?.length > 0
                  ? stats.upcomingHearings.map(h => (
                    <tr key={h._id}>
                      <td style={{whiteSpace:'nowrap'}}>{new Date(h.hearingDate).toLocaleDateString('en-IN')}</td>
                      <td><code style={{fontSize:12}}>{h.case?.caseNumber}</code></td>
                      <td>{h.purpose}</td>
                      <td>{h.courtRoom || '—'}</td>
                    </tr>
                  ))
                  : <tr><td colSpan={4} style={{textAlign:'center', color:'var(--gray-400)', padding:24}}>No upcoming hearings</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

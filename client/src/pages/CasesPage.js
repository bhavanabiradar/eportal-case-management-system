import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['', 'Registered', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Disposed', 'Closed'];
const TYPE_OPTIONS = ['', 'Civil', 'Criminal', 'Family', 'Labour', 'Revenue', 'Constitutional', 'Other'];

const badgeClass = (s) => {
  const map = { Registered:'registered', 'Under Review':'review', 'Hearing Scheduled':'scheduled', 'In Progress':'progress', Disposed:'disposed', Closed:'closed' };
  return 'badge badge-' + (map[s] || 'registered');
};

const typeBadgeClass = (t) => 'badge badge-' + (t || 'other').toLowerCase();

export default function CasesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchCases = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (caseType) params.set('caseType', caseType);
    axios.get('/api/cases?' + params)
      .then(r => { setCases(r.data.cases); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCases(); }, [page, status, caseType]);
  const handleSearch = e => { e.preventDefault(); setPage(1); fetchCases(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Cases</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>{total} case{total !== 1 ? 's' : ''} found</p>
        </div>
        {['admin', 'lawyer'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => navigate('/cases/new')}>+ Register New Case</button>
        )}
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search case no., title, petitioner..." />
          <button type="submit" className="btn btn-outline btn-sm">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '9px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={caseType} onChange={e => { setCaseType(e.target.value); setPage(1); }} style={{ padding: '9px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Case No.</th><th>Title</th><th>Type</th><th>Petitioner</th>
                <th>Respondent</th><th>Next Hearing</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8}><div style={{textAlign:'center', padding:32, color:'var(--gray-400)'}}>Loading...</div></td></tr>
                : cases.length > 0
                  ? cases.map(c => (
                    <tr key={c._id}>
                      <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{c.caseNumber}</code></td>
                      <td style={{ maxWidth: 200 }}>
                        <Link to={`/cases/${c._id}`} style={{ color: 'var(--navy)', fontWeight: 600, fontSize: 14 }}>{c.title}</Link>
                      </td>
                      <td><span className={typeBadgeClass(c.caseType)}>{c.caseType}</span></td>
                      <td>{c.petitioner?.name}</td>
                      <td>{c.respondent?.name}</td>
                      <td style={{ whiteSpace: 'nowrap', color: c.nextHearingDate ? 'inherit' : 'var(--gray-400)' }}>
                        {c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('en-IN') : 'Not scheduled'}
                      </td>
                      <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                      <td><Link to={`/cases/${c._id}`} className="btn btn-outline btn-sm">View</Link></td>
                    </tr>
                  ))
                  : <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📂</div><p>No cases found</p></div></td></tr>
              }
            </tbody>
          </table>
        </div>
        {total > limit && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            <span className="page-info">Page {page} of {Math.ceil(total / limit)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

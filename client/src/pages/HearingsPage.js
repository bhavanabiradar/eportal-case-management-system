import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusColor = (s) => {
  const map = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Adjourned: 'badge-adjourned', Cancelled: 'badge-cancelled' };
  return map[s] || 'badge-scheduled';
};

export default function HearingsPage() {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Update hearing outcome modal
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [newStatus, setNewStatus] = useState('Completed');
  const [nextDate, setNextDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchHearings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterDate) params.append('date', filterDate);
      const r = await axios.get(`/api/hearings?${params}`);
      setHearings(r.data.hearings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHearings(); }, [filterStatus, filterDate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = { status: newStatus, outcome };
      if (newStatus === 'Adjourned' && nextDate) payload.nextDate = nextDate;
      await axios.put(`/api/hearings/${selected._id}`, payload);
      setSelected(null);
      fetchHearings();
    } catch (err) { alert('Update failed'); }
    finally { setUpdating(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hearings</h1>
          <p className="page-subtitle">All scheduled and past hearings</p>
        </div>
      </div>

      {/* Upcoming strip */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-lit) 100%)',
        borderRadius: 12, padding: '16px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20, color: 'white',
      }}>
        <span style={{ fontSize: 28 }}>📅</span>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, color: '#c9a84c' }}>
            Today's Hearings
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginLeft: 'auto', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          onClick={() => setFilterDate(today)}>
          View Today
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input type="date" className="search-input" value={filterDate}
          onChange={e => setFilterDate(e.target.value)} style={{ minWidth: 160 }} />
        <select className="form-control" style={{ width: 160 }} value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['Scheduled', 'Completed', 'Adjourned', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-outline" onClick={() => { setFilterStatus(''); setFilterDate(''); }}>Clear</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40 }}><div className="spinner" /></div>
        ) : hearings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No hearings found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case No.</th>
                  <th>Case Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Court Room</th>
                  <th>Purpose</th>
                  <th>Judge</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {hearings.map(h => (
                  <tr key={h._id}>
                    <td style={{ fontWeight: 700, fontSize: 12, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                      <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate(`/cases/${h.case?._id}`)}>
                        {h.case?.caseNumber}
                      </span>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {h.case?.title}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.hearingDate).toLocaleDateString()}</td>
                    <td>{h.hearingTime}</td>
                    <td>{h.courtRoom || '—'}</td>
                    <td style={{ fontSize: 13 }}>{h.purpose}</td>
                    <td style={{ fontSize: 13 }}>{h.judge?.name || '—'}</td>
                    <td><span className={`badge ${statusColor(h.status)}`}>{h.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.outcome || '—'}
                    </td>
                    <td>
                      {h.status === 'Scheduled' && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => { setSelected(h); setOutcome(''); setNewStatus('Completed'); setNextDate(''); }}>
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Outcome Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Hearing Outcome</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
              {selected.case?.caseNumber} — {selected.purpose} on {new Date(selected.hearingDate).toLocaleDateString()}
            </p>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Hearing Status</label>
                <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['Completed', 'Adjourned', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Outcome / Notes</label>
                <textarea className="form-control" rows={3} value={outcome}
                  onChange={e => setOutcome(e.target.value)} placeholder="Summary of what happened..." />
              </div>
              {newStatus === 'Adjourned' && (
                <div className="form-group">
                  <label className="form-label">Next Hearing Date</label>
                  <input type="date" className="form-control" value={nextDate}
                    onChange={e => setNextDate(e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Outcome'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

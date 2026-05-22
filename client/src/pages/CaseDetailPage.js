import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColor = (s) => {
  const map = {
    'Registered': 'badge-registered', 'In Progress': 'badge-in-progress',
    'Hearing Scheduled': 'badge-hearing-scheduled', 'Disposed': 'badge-disposed',
    'Closed': 'badge-closed', 'Under Review': 'badge-under-review',
  };
  return map[s] || 'badge-closed';
};

const hearingStatusColor = (s) => {
  const map = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Adjourned: 'badge-adjourned', Cancelled: 'badge-cancelled' };
  return map[s] || 'badge-scheduled';
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Hearing modal state
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [hearingForm, setHearingForm] = useState({ hearingDate: '', hearingTime: '', courtRoom: '', purpose: '' });
  const [hearingLoading, setHearingLoading] = useState(false);

  // Document upload state
  const [docFile, setDocFile] = useState(null);
  const [docForm, setDocForm] = useState({ title: '', documentType: 'Petition', remarks: '' });
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/cases/${id}`),
      axios.get(`/api/hearings?caseId=${id}`),
      axios.get(`/api/documents/${id}`),
    ]).then(([cr, hr, dr]) => {
      setC(cr.data.case);
      setHearings(hr.data.hearings);
      setDocuments(dr.data.documents);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const scheduleHearing = async (e) => {
    e.preventDefault();
    setHearingLoading(true);
    try {
      await axios.post('/api/hearings', { case: id, ...hearingForm });
      const r = await axios.get(`/api/hearings?caseId=${id}`);
      setHearings(r.data.hearings);
      setShowHearingModal(false);
      setHearingForm({ hearingDate: '', hearingTime: '', courtRoom: '', purpose: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule hearing');
    } finally { setHearingLoading(false); }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) return alert('Select a file first');
    const fd = new FormData();
    fd.append('document', docFile);
    fd.append('caseId', id);
    fd.append('title', docForm.title);
    fd.append('documentType', docForm.documentType);
    fd.append('remarks', docForm.remarks);
    setDocLoading(true);
    try {
      await axios.post('/api/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const r = await axios.get(`/api/documents/${id}`);
      setDocuments(r.data.documents);
      setDocFile(null); setDocForm({ title: '', documentType: 'Petition', remarks: '' });
    } catch (err) {
      alert('Upload failed');
    } finally { setDocLoading(false); }
  };

  const updateStatus = async (status) => {
    await axios.put(`/api/cases/${id}`, { status });
    const r = await axios.get(`/api/cases/${id}`);
    setC(r.data.case);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!c) return <div>Case not found.</div>;

  const canSchedule = ['admin', 'judge'].includes(user?.role);
  const canUpload = ['admin', 'lawyer', 'judge'].includes(user?.role);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{c.caseNumber}</h1>
            <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
          </div>
          <p className="page-subtitle">{c.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canSchedule && <button className="btn btn-gold" onClick={() => setShowHearingModal(true)}>+ Schedule Hearing</button>}
          <button className="btn btn-outline" onClick={() => navigate('/cases')}>← Back</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid var(--gray-100)' }}>
        {['overview', 'hearings', 'documents'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: 600, background: 'none', textTransform: 'capitalize',
              color: activeTab === tab ? 'var(--navy)' : 'var(--gray-500)',
              borderBottom: activeTab === tab ? '2px solid var(--navy)' : '2px solid transparent',
              marginBottom: -2,
            }}>
            {tab} {tab === 'hearings' && `(${hearings.length})`}
            {tab === 'documents' && `(${documents.length})`}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: 16 }}>Case Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Case Type', c.caseType],
                  ['Priority', c.priority],
                  ['Filed By', c.filedBy?.name],
                  ['Assigned Judge', c.assignedJudge?.name || '—'],
                  ['Next Hearing', c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString() : '—'],
                  ['Filed On', new Date(c.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.6px' }}>{k}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              {c.description && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 6 }}>Description</div>
                  <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>{c.description}</p>
                </div>
              )}
            </div>

            {/* Parties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['Petitioner', c.petitioner, c.petitionerLawyer], ['Respondent', c.respondent, c.respondentLawyer]].map(([label, party, lawyer]) => (
                <div key={label} className="card">
                  <h4 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: 12 }}>{label}</h4>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{party?.name}</div>
                  {party?.contact && <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{party.contact}</div>}
                  {party?.address && <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{party.address}</div>}
                  {lawyer && <div style={{ marginTop: 8, fontSize: 12, padding: '4px 8px', background: 'var(--gray-50)', borderRadius: 4 }}>
                    Lawyer: <strong>{lawyer.name}</strong>
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Status update sidebar */}
          {['admin', 'judge'].includes(user?.role) && (
            <div className="card" style={{ height: 'fit-content' }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: 14 }}>Update Status</h4>
              {['Registered', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Disposed', 'Closed'].map(s => (
                <button key={s} className="btn btn-outline" style={{
                  width: '100%', marginBottom: 8, justifyContent: 'flex-start',
                  background: c.status === s ? 'var(--navy)' : '',
                  color: c.status === s ? 'white' : '',
                }} onClick={() => updateStatus(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hearings Tab */}
      {activeTab === 'hearings' && (
        <div className="card">
          {hearings.length === 0
            ? <p style={{ color: 'var(--gray-500)', padding: 20 }}>No hearings scheduled yet.</p>
            : <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>Time</th><th>Court Room</th><th>Purpose</th><th>Judge</th><th>Status</th><th>Outcome</th></tr>
                </thead>
                <tbody>
                  {hearings.map(h => (
                    <tr key={h._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.hearingDate).toLocaleDateString()}</td>
                      <td>{h.hearingTime}</td>
                      <td>{h.courtRoom || '—'}</td>
                      <td>{h.purpose}</td>
                      <td>{h.judge?.name || '—'}</td>
                      <td><span className={`badge ${hearingStatusColor(h.status)}`}>{h.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{h.outcome || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          {canUpload && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: 16 }}>Upload Document</h4>
              <form onSubmit={uploadDocument}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Document Title</label>
                    <input type="text" className="form-control" value={docForm.title}
                      onChange={e => setDocForm({ ...docForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select className="form-control" value={docForm.documentType}
                      onChange={e => setDocForm({ ...docForm, documentType: e.target.value })}>
                      {['Petition', 'Evidence', 'Affidavit', 'Order', 'Notice', 'Reply', 'Other'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">File (PDF, DOC, JPG)</label>
                    <input type="file" className="form-control" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={e => setDocFile(e.target.files[0])} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <input type="text" className="form-control" value={docForm.remarks}
                      onChange={e => setDocForm({ ...docForm, remarks: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={docLoading}>
                  {docLoading ? 'Uploading...' : '↑ Upload Document'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            {documents.length === 0
              ? <p style={{ color: 'var(--gray-500)' }}>No documents uploaded yet.</p>
              : <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Title</th><th>Type</th><th>Uploaded By</th><th>Verified</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 500 }}>{d.title}</td>
                        <td><span className="badge badge-registered">{d.documentType}</span></td>
                        <td style={{ fontSize: 13 }}>{d.uploadedBy?.name}</td>
                        <td>{d.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <a
                            href={`${axios.defaults.baseURL || 'http://localhost:5000'}/uploads/${d.fileName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ marginRight: 6, textDecoration: 'none' }}
                          >
                            View
                          </a>
                          <a
                            href={`${axios.defaults.baseURL || 'http://localhost:5000'}/uploads/${d.fileName}`}
                            download={d.title}
                            className="btn btn-outline btn-sm"
                            style={{ textDecoration: 'none' }}
                          >
                            ↓ Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="modal-overlay" onClick={() => setShowHearingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Hearing</h3>
              <button className="modal-close" onClick={() => setShowHearingModal(false)}>×</button>
            </div>
            <form onSubmit={scheduleHearing}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hearing Date *</label>
                  <input type="date" className="form-control"
                    value={hearingForm.hearingDate}
                    onChange={e => setHearingForm({ ...hearingForm, hearingDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" className="form-control"
                    value={hearingForm.hearingTime}
                    onChange={e => setHearingForm({ ...hearingForm, hearingTime: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Court Room</label>
                  <input type="text" className="form-control" placeholder="e.g., Court Hall 3"
                    value={hearingForm.courtRoom}
                    onChange={e => setHearingForm({ ...hearingForm, courtRoom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose *</label>
                  <input type="text" className="form-control" placeholder="e.g., Evidence Presentation"
                    value={hearingForm.purpose}
                    onChange={e => setHearingForm({ ...hearingForm, purpose: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={hearingLoading}>
                  {hearingLoading ? 'Scheduling...' : 'Schedule Hearing'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowHearingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

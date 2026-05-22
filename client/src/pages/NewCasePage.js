import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Labour', 'Revenue', 'Constitutional', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function NewCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', caseType: 'Civil', priority: 'Medium', description: '',
    'petitioner.name': '', 'petitioner.contact': '', 'petitioner.address': '',
    'respondent.name': '', 'respondent.contact': '', 'respondent.address': '',
  });
  const [lawyers,   setLawyers]   = useState([]);
  const [judges,    setJudges]    = useState([]);
  const [litigants, setLitigants] = useState([]);

  const [petitionerLawyer, setPetitionerLawyer] = useState('');
  const [respondentLawyer, setRespondentLawyer] = useState('');
  const [assignedJudge,    setAssignedJudge]    = useState('');
  const [petitionerUser,   setPetitionerUser]   = useState('');
  const [respondentUser,   setRespondentUser]   = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    axios.get('/api/users/lawyers').then(r => setLawyers(r.data.lawyers)).catch(() => {});
    axios.get('/api/users/judges').then(r => setJudges(r.data.judges)).catch(() => {});
    axios.get('/api/users/litigants').then(r => setLitigants(r.data.litigants)).catch(() => {});
  }, []);

  // When a litigant is selected, auto-fill their name
  const handlePetitionerUser = (e) => {
    const id = e.target.value;
    setPetitionerUser(id);
    if (id) {
      const l = litigants.find(x => x._id === id);
      if (l) setForm(f => ({ ...f, 'petitioner.name': l.name }));
    }
  };

  const handleRespondentUser = (e) => {
    const id = e.target.value;
    setRespondentUser(id);
    if (id) {
      const l = litigants.find(x => x._id === id);
      if (l) setForm(f => ({ ...f, 'respondent.name': l.name }));
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        title: form.title, caseType: form.caseType,
        priority: form.priority, description: form.description,
        petitioner: { name: form['petitioner.name'], contact: form['petitioner.contact'], address: form['petitioner.address'] },
        respondent: { name: form['respondent.name'], contact: form['respondent.contact'], address: form['respondent.address'] },
      };
      if (petitionerLawyer) payload.petitionerLawyer = petitionerLawyer;
      if (respondentLawyer) payload.respondentLawyer = respondentLawyer;
      if (assignedJudge)    payload.assignedJudge    = assignedJudge;
      if (petitionerUser)   payload.petitionerUser   = petitionerUser;
      if (respondentUser)   payload.respondentUser   = respondentUser;

      const res = await axios.post('/api/cases', payload);
      navigate(`/cases/${res.data.case._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register case.');
    } finally { setLoading(false); }
  };

  const sectionStyle = { fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: 16 };
  const dividerStyle = { borderBottom: '1px solid var(--gray-100)', paddingBottom: 8, marginBottom: 16 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Register New Case</h1>
          <p className="page-subtitle">Fill in all required fields to file a new case</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/cases')}>← Back</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Case Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={sectionStyle}>Case Information</h3>
          <div className="form-group">
            <label className="form-label">Case Title *</label>
            <input className="form-control" name="title" value={form.title}
              onChange={handleChange} placeholder="e.g. Aarav Gupta vs State of Karnataka" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Case Type *</label>
              <select className="form-control" name="caseType" value={form.caseType} onChange={handleChange}>
                {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} name="description"
              value={form.description} onChange={handleChange}
              placeholder="Brief description of the case..." />
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Petitioner */}
          <div className="card">
            <h3 style={sectionStyle}>Petitioner</h3>
            <div className="form-group">
              <label className="form-label">Link to Registered User</label>
              <select className="form-control" value={petitionerUser} onChange={handlePetitionerUser}>
                <option value="">— Select litigant account (optional) —</option>
                {litigants.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
              <small style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 4, display: 'block' }}>
                Linking lets this person view the case when they log in
              </small>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" name="petitioner.name"
                value={form['petitioner.name']} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact</label>
              <input className="form-control" name="petitioner.contact"
                value={form['petitioner.contact']} onChange={handleChange} placeholder="Phone / Email" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} name="petitioner.address"
                value={form['petitioner.address']} onChange={handleChange} />
            </div>
          </div>

          {/* Respondent */}
          <div className="card">
            <h3 style={sectionStyle}>Respondent</h3>
            <div className="form-group">
              <label className="form-label">Link to Registered User</label>
              <select className="form-control" value={respondentUser} onChange={handleRespondentUser}>
                <option value="">— Select litigant account (optional) —</option>
                {litigants.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
              <small style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 4, display: 'block' }}>
                Linking lets this person view the case when they log in
              </small>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" name="respondent.name"
                value={form['respondent.name']} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact</label>
              <input className="form-control" name="respondent.contact"
                value={form['respondent.contact']} onChange={handleChange} placeholder="Phone / Email" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} name="respondent.address"
                value={form['respondent.address']} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={sectionStyle}>Legal Assignments</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Petitioner's Lawyer</label>
              <select className="form-control" value={petitionerLawyer}
                onChange={e => setPetitionerLawyer(e.target.value)}>
                <option value="">— Select Lawyer —</option>
                {lawyers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Respondent's Lawyer</label>
              <select className="form-control" value={respondentLawyer}
                onChange={e => setRespondentLawyer(e.target.value)}>
                <option value="">— Select Lawyer —</option>
                {lawyers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned Judge</label>
              <select className="form-control" value={assignedJudge}
                onChange={e => setAssignedJudge(e.target.value)}>
                <option value="">— Select Judge —</option>
                {judges.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : '⚖ Register Case'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/cases')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Labour', 'Revenue', 'Constitutional', 'Other'];
const PRIORITIES  = ['Low', 'Medium', 'High', 'Urgent'];

export default function NewCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', caseType: 'Civil', priority: 'Medium', description: '',
    'petitioner.name': '', 'petitioner.contact': '', 'petitioner.address': '',
    'respondent.name': '', 'respondent.contact': '', 'respondent.address': '',
  });
  const [lawyers, setLawyers] = useState([]);
  const [judges, setJudges]   = useState([]);
  const [petitionerLawyer, setPetitionerLawyer] = useState('');
  const [respondentLawyer, setRespondentLawyer] = useState('');
  const [assignedJudge, setAssignedJudge]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    axios.get('/api/users/lawyers').then(r => setLawyers(r.data.lawyers)).catch(() => {});
    axios.get('/api/users/judges').then(r => setJudges(r.data.judges)).catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        title: form.title, caseType: form.caseType, priority: form.priority, description: form.description,
        petitioner: { name: form['petitioner.name'], contact: form['petitioner.contact'], address: form['petitioner.address'] },
        respondent: { name: form['respondent.name'], contact: form['respondent.contact'], address: form['respondent.address'] },
      };
      if (petitionerLawyer) payload.petitionerLawyer = petitionerLawyer;
      if (respondentLawyer) payload.respondentLawyer = respondentLawyer;
      if (assignedJudge)    payload.assignedJudge    = assignedJudge;

      const res = await axios.post('/api/cases', payload);
      navigate(`/cases/${res.data.case._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register case.');
    } finally { setLoading(false); }
  };

  const F = ({ label, name, type='text', placeholder, required, as }) => (
    <div className="form-group">
      <label>{label}{required && ' *'}</label>
      {as === 'textarea'
        ? <textarea name={name} value={form[name] || ''} onChange={handleChange} placeholder={placeholder} />
        : <input type={type} name={name} value={form[name] || ''} onChange={handleChange} placeholder={placeholder} required={required} />
      }
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Register New Case</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Fill in all required fields to file a new case</p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Case Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">Case Information</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group full">
                <label>Case Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Brief descriptive title of the case" required />
              </div>
              <div className="form-group">
                <label>Case Type *</label>
                <select name="caseType" value={form.caseType} onChange={handleChange}>
                  {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the case..." />
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">Parties Involved</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="section-divider"><h3>Petitioner</h3><hr /></div>
              <F label="Name" name="petitioner.name" placeholder="Full name" required />
              <F label="Contact" name="petitioner.contact" placeholder="Phone / Email" />
              <div className="form-group full"><label>Address</label>
                <textarea name="petitioner.address" value={form['petitioner.address']} onChange={handleChange} placeholder="Full address" />
              </div>

              <div className="section-divider"><h3>Respondent</h3><hr /></div>
              <F label="Name" name="respondent.name" placeholder="Full name" required />
              <F label="Contact" name="respondent.contact" placeholder="Phone / Email" />
              <div className="form-group full"><label>Address</label>
                <textarea name="respondent.address" value={form['respondent.address']} onChange={handleChange} placeholder="Full address" />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Legal Assignments</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Petitioner's Lawyer</label>
                <select value={petitionerLawyer} onChange={e => setPetitionerLawyer(e.target.value)}>
                  <option value="">— Select Lawyer —</option>
                  {lawyers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Respondent's Lawyer</label>
                <select value={respondentLawyer} onChange={e => setRespondentLawyer(e.target.value)}>
                  <option value="">— Select Lawyer —</option>
                  {lawyers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Judge</label>
                <select value={assignedJudge} onChange={e => setAssignedJudge(e.target.value)}>
                  <option value="">— Select Judge —</option>
                  {judges.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/cases')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Registering...</> : '✓ Register Case'}
          </button>
        </div>
      </form>
    </div>
  );
}

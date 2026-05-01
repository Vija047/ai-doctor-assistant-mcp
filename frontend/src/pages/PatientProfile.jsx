import React from 'react';

const PatientProfile = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            U
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Patient Name</h2>
            <p>patient@example.com</p>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="input-field" defaultValue="John Doe" readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="input-field" defaultValue="john@example.com" readOnly />
        </div>
        <button className="btn-primary">Update Profile</button>
      </div>
    </div>
  );
};
export default PatientProfile;

import React from 'react';

const SettingsPage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>System Settings</h1>
      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Clinic Preferences</h3>
        <div className="form-group">
          <label className="form-label">Clinic Name</label>
          <input type="text" className="input-field" defaultValue="MediCare Pro General Hospital" />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Email</label>
          <input type="email" className="input-field" defaultValue="contact@medicare.com" />
        </div>
        
        <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Notification Settings</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <input type="checkbox" id="emailNotif" defaultChecked />
          <label htmlFor="emailNotif" style={{ fontSize: '0.875rem' }}>Send Email Confirmations to Patients</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <input type="checkbox" id="smsNotif" />
          <label htmlFor="smsNotif" style={{ fontSize: '0.875rem' }}>Send SMS Reminders</label>
        </div>

        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};

export default SettingsPage;

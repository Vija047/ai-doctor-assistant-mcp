import React, { useState, useEffect } from 'react';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Patient Records</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={i}>
                <td>#{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.username}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.email}</td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan="3">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Patients;

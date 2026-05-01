import React, { useState, useEffect } from 'react';

const PatientHistory = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const endpoint = username 
      ? `http://localhost:8000/api/appointments/${username}`
      : 'http://localhost:8000/api/appointments';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>My Booked History</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{apt.doctor_name || 'Unknown'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{apt.date}</td>
                <td style={{ color: 'var(--text-muted)' }}>{apt.time}</td>
                <td>
                  <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan="4">No booked appointments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default PatientHistory;

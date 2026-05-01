import React, { useState, useEffect } from 'react';
import { Users, Calendar, Thermometer, Clock, UserRound } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const role = localStorage.getItem('role');
  const isDoctor = role === 'doctor';
  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    if (isDoctor) {
      fetch('http://localhost:8000/api/analytics')
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(err => console.error(err));

      fetch('http://localhost:8000/api/appointments')
        .then(res => res.json())
        .then(data => setRecentAppointments(data.slice(-5).reverse())) // Get 5 most recent
        .catch(err => console.error(err));
    } else {
      fetch('http://localhost:8000/api/doctors')
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(err => console.error(err));
        
      fetch(`http://localhost:8000/api/appointments/${username}`)
        .then(res => res.json())
        .then(data => setRecentAppointments(data.slice(-5).reverse()))
        .catch(err => console.error(err));
    }
  }, [isDoctor, username]);

  if (isDoctor) {
    if (!analytics) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

    const { metrics, weekly_data } = analytics;

    return (
      <div>
        <h1 style={{ marginBottom: '0.25rem' }}>Good morning, Dr. Ahuja</h1>
        <p style={{ marginBottom: '2rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', marginTop: '-4rem' }}>
          <button className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
            ↓ Export Report
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Total Patients Today</span>
              <div className="metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="metric-value">{metrics.total_patients_today}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Appointments Tomorrow</span>
              <div className="metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                <Calendar size={18} />
              </div>
            </div>
            <div className="metric-value">{metrics.appointments_tomorrow}</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Fever Cases This Week</span>
              <div className="metric-icon" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                <Thermometer size={18} />
              </div>
            </div>
            <div className="metric-value">{metrics.fever_cases_this_week}</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Pending Confirmations</span>
              <div className="metric-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value">{metrics.pending_confirmations}</div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem' }}>Weekly Overview</h3>
              <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>•••</span>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly_data}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem' }}>Recent Appointments</h3>
              <Link to="/schedule" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{apt.patient_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{apt.doctor_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{apt.time}</td>
                    <td>
                      <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentAppointments.length === 0 && (
                  <tr><td colSpan="4">No recent appointments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Patient Dashboard View
  return (
    <div>
      <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {username}</h1>
      <p style={{ marginBottom: '2rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', marginTop: '-4rem', alignItems: 'center' }}>
        <div />
        <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none' }}>
          Book Appointment
        </Link>
      </div>

      <div className="dashboard-sections patient-view">
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem' }}>Available Doctors</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {doctors.map((doc, index) => (
              <div key={index} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <UserRound size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{doc.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doc.specialization}</p>
                </div>
              </div>
            ))}
            {doctors.length === 0 && <p>No doctors available at the moment.</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem' }}>Your Recent Appointments</h3>
            <Link to="/history" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{apt.doctor_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{apt.date} {apt.time}</td>
                  <td>
                    <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr><td colSpan="3">You have no recent appointments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

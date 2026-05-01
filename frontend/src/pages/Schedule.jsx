import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        
        // Transform data into calendar events
        const calendarEvents = data.map(apt => {
          // Parse date and time into a single Date object
          // Adding artificial default time if missing just to prevent parsing errors
          const timeString = apt.time && apt.time.length > 0 ? apt.time : "09:00";
          const start = new Date(`${apt.date}T${timeString}:00`);
          // Assume 1 hour duration
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          
          return {
            id: apt.id,
            title: `${apt.patient_name} (${apt.status})`,
            start: start,
            end: end,
            allDay: false,
            resource: apt,
          };
        });
        
        setEvents(calendarEvents);
      })
      .catch(err => console.error(err));
  }, []);

  // Custom styling for events based on status
  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = 'var(--primary)';
    if (event.resource.status.toLowerCase() === 'pending') {
      backgroundColor = '#f59e0b'; // amber
    } else if (event.resource.status.toLowerCase() === 'cancelled') {
      backgroundColor = '#ef4444'; // red
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px'
      }
    };
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Master Schedule</h1>
      
      {/* Calendar View */}
      <div className="card" style={{ height: '60vh', minHeight: '400px', padding: '1.5rem', marginBottom: '2rem' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      {/* Appointment List View */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Appointment Details List</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt, i) => (
              <tr key={i}>
                <td>#{apt.id}</td>
                <td style={{ fontWeight: 500 }}>{apt.patient_name}</td>
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
              <tr><td colSpan="5">No appointments scheduled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;

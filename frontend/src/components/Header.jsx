import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isDoctor }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="topbar">
      <div className="topbar-tabs">
        {isDoctor ? (
          <>
            <Link to="/dashboard" className={`topbar-tab ${currentPath === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/patients" className={`topbar-tab ${currentPath === '/patients' ? 'active' : ''}`}>Patients</Link>
            <Link to="/schedule" className={`topbar-tab ${currentPath === '/schedule' ? 'active' : ''}`}>Schedule</Link>
            <Link to="/analytics" className={`topbar-tab ${currentPath === '/analytics' ? 'active' : ''}`}>Analytics</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`topbar-tab ${currentPath === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/chat" className={`topbar-tab ${currentPath === '/chat' ? 'active' : ''}`}>Messages</Link>
            <Link to="/history" className={`topbar-tab ${currentPath === '/history' ? 'active' : ''}`}>Booked History</Link>
            <Link to="/profile" className={`topbar-tab ${currentPath === '/profile' ? 'active' : ''}`}>Profile</Link>
          </>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Bell size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        <HelpCircle size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        <div className="avatar" style={{ overflow: 'hidden', cursor: 'pointer' }}>
          <img src="https://ui-avatars.com/api/?name=User&background=04724d&color=fff" alt="User" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default Header;

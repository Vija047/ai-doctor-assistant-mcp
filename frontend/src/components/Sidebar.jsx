import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isDoctor }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadChats = () => {
      const username = localStorage.getItem('username') || 'guest';
      setRecentChats(JSON.parse(localStorage.getItem(`chat_sessions_${username}`) || '[]'));
    };
    loadChats();
    window.addEventListener('chat_updated', loadChats);
    return () => window.removeEventListener('chat_updated', loadChats);
  }, []);

  const doctorLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Patient Records', icon: <Users size={20} />, path: '/patients' },
    { name: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/chat' },
    { name: 'Calendar', icon: <Calendar size={20} />, path: '/schedule' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const handleNewChat = () => {
    navigate('/chat');
    if (window.innerWidth <= 768) setIsMobileMenuOpen(false);
  };

  return (
    <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header" style={{ borderBottom: isDoctor ? 'none' : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div className="logo-icon">
            {isDoctor ? <LayoutDashboard size={18} /> : <span style={{fontWeight: 600}}>M</span>}
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
            {isDoctor ? 'MediCare Pro' : 'MediAgent'}
          </h2>
        </div>
        
        {/* Mobile Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="dot-menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <div className="sidebar-nav">
        {isDoctor ? (
          doctorLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.path}
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
              style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
              onClick={() => { if (window.innerWidth <= 768) setIsMobileMenuOpen(false); }}
            >
              {link.icon}
              {link.name}
            </Link>
          ))
        ) : (
          <>
            <div onClick={handleNewChat} className="new-chat-btn-wrapper" style={{cursor: 'pointer', textDecoration: 'none'}}>
              <div className="btn-primary new-chat-btn" style={{width: '100%', marginBottom: '2rem'}}>
                + New Chat
              </div>
            </div>
            
            <p className="recent-label" style={{marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em'}}>RECENT</p>
            
            {recentChats.map((chat, index) => (
              <Link 
                key={index} 
                to={`/chat?session=${chat.id}`}
                className={`nav-item ${location.search.includes(chat.id) ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                <MessageSquare size={16} />
                {chat.title}
              </Link>
            ))}
            
            {recentChats.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0 1rem' }}>No recent chats.</p>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="nav-item" style={{ cursor: 'pointer' }}>
          <HelpCircle size={20} />
          Support
        </div>
        <Link to="/login" className="nav-item">
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Patients from './pages/Patients';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import PatientHistory from './pages/PatientHistory';
import PatientProfile from './pages/PatientProfile';
import Settings from './pages/Settings';
import './index.css';

// Layout component to wrap pages that need the sidebar and header
const AppLayout = ({ children }) => {
  const isDoctor = localStorage.getItem('role') === 'doctor';
  
  return (
    <div className="app-container">
      <Sidebar isDoctor={isDoctor} />
      <div className="main-content">
        <Header isDoctor={isDoctor} />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <AppLayout>
              <Chat />
            </AppLayout>
          } 
        />
        <Route path="/patients" element={<AppLayout><Patients /></AppLayout>} />
        <Route path="/schedule" element={<AppLayout><Schedule /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
        <Route path="/history" element={<AppLayout><PatientHistory /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><PatientProfile /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

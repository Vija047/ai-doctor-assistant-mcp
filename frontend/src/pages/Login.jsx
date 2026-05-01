import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOff, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Login = () => {
  const [isDoctor, setIsDoctor] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isDoctor) {
        localStorage.setItem('role', 'doctor');
        localStorage.setItem('username', 'doctor_admin');
        navigate('/dashboard');
        return;
      }

      // Patient login or register hitting the backend
      const endpoint = isLoginMode ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
      
      const payload = isLoginMode 
        ? { username: email, password: password } // Backend expects 'username' for login, we send email string as username for simplicity
        : { username: username, email: email, password: password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Store token (in a real app, store in localStorage/context)
      console.log("Success! Token:", data.access_token);
      localStorage.setItem('role', 'patient');
      localStorage.setItem('username', data.username);
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (e) => {
    e.preventDefault();
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        <div className="login-image-wrapper">
          <div style={{ width: '100%', height: '500px', backgroundColor: '#2f9e83', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
              alt="Doctor" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
            />
          </div>
          <div className="login-badge">
            <div className="badge-icon">
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Next Slot</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>10:30 AM</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>+</span> MediCare SaaS
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {isLoginMode ? 'Welcome back' : 'Create Account'}
          </h1>
          <p style={{ marginBottom: '2.5rem', fontSize: '1rem' }}>
            {isLoginMode ? 'Please enter your details to sign in.' : 'Fill in the form to register as a new patient.'}
          </p>

          <div className="toggle-group">
            <button 
              className={`toggle-btn ${isDoctor ? 'active' : ''}`}
              onClick={() => setIsDoctor(true)}
              type="button"
            >
              Doctor
            </button>
            <button 
              className={`toggle-btn ${!isDoctor ? 'active' : ''}`}
              onClick={() => setIsDoctor(false)}
              type="button"
            >
              Patient
            </button>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLoginMode && !isDoctor && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Choose a username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your email or username" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                {isLoginMode && (
                  <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <EyeOff size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In →' : 'Sign Up →')}
            </button>
          </form>

          {!isDoctor && (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <a href="#" onClick={toggleMode} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

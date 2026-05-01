import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSession = searchParams.get('session');
  
  const [sessionId, setSessionId] = useState(currentSession || `session_${Math.floor(Math.random() * 10000)}`);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL change or new session
  useEffect(() => {
    const activeSession = searchParams.get('session');
    const username = localStorage.getItem('username') || 'guest';
    if (activeSession) {
      setSessionId(activeSession);
      const saved = localStorage.getItem(`chat_${username}_${activeSession}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // If they navigate to an empty session that doesn't exist
        const isDoctor = localStorage.getItem('role') === 'doctor';
        setMessages([{
          role: 'bot',
          content: isDoctor ? "Hello Doctor! I'm MediAgent. I can help you check patient reports, analyze clinic statistics, or manage your schedule." : "Hello! I'm MediAgent. How can I help you today? You can ask me to check doctor availability or book an appointment.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } else {
      // New chat triggered
      const newId = `session_${Math.floor(Math.random() * 10000)}`;
      setSessionId(newId);
      setSearchParams({ session: newId }, { replace: true });
      const isDoctor = localStorage.getItem('role') === 'doctor';
      setMessages([{
        role: 'bot',
        content: isDoctor ? "Hello Doctor! I'm MediAgent. I can help you check patient reports, analyze clinic statistics, or manage your schedule." : "Hello! I'm MediAgent. How can I help you today? You can ask me to check doctor availability or book an appointment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [searchParams]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Only save if user has sent something
      const username = localStorage.getItem('username') || 'guest';
      localStorage.setItem(`chat_${username}_${sessionId}`, JSON.stringify(messages));
      
      // Update global sessions list for the sidebar
      const sessions = JSON.parse(localStorage.getItem(`chat_sessions_${username}`) || '[]');
      const userMessage = messages.find(m => m.role === 'user');
      if (userMessage) {
        const title = userMessage.content.substring(0, 25) + '...';
        const existingIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (existingIndex >= 0) {
          sessions[existingIndex].title = title;
        } else {
          sessions.unshift({ id: sessionId, title });
        }
        
        localStorage.setItem(`chat_sessions_${username}`, JSON.stringify(sessions));
        window.dispatchEvent(new Event('chat_updated'));
      }
    }
  }, [messages, sessionId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage, time: currentTime }]);
    setInput('');
    setIsLoading(true);

    try {
      // Connect to the real FastAPI backend
      const role = localStorage.getItem('role') || 'patient';
      const username = localStorage.getItem('username') || 'guest';
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          role: role,
          username: username
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.reply, 
        time: botTime,
        toolUsed: data.tool_used 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback message if backend is not running
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Sorry, I couldn't connect to the server. Please ensure the FastAPI backend is running on port 8000.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="avatar">
                <Bot size={18} />
              </div>
            )}
            <div style={{ maxWidth: '80%' }}>
              <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              <span className="message-time">
                {msg.toolUsed && <span style={{color: 'var(--primary)', marginRight: '8px'}}>Used tool: {msg.toolUsed}</span>}
                {msg.time}
              </span>
            </div>
            {msg.role === 'user' && (
              <div className="avatar" style={{ backgroundColor: '#e5e7eb', color: '#4b5563' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>U</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message-row bot">
            <div className="avatar"><Bot size={18} /></div>
            <div className="message-content" style={{ padding: '0.5rem 1rem' }}>
              <span className="typing-indicator">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ paddingBottom: '1rem' }}>
        <form onSubmit={handleSend} className="chat-input-container">
          <input 
            type="text" 
            className="chat-input"
            placeholder={localStorage.getItem('role') === 'doctor' ? "Ask for patient reports, stats, etc..." : "Type your request (e.g. check availability)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Paperclip size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          MediAgent can make mistakes. Consider verifying important clinical information.
        </p>
      </div>
    </div>
  );
};

export default Chat;

import { useState, useEffect, useRef } from 'react';
import VoiceSessionUI from './VoiceSession';
import Header from '../components/Header';
import useUser from '../lib/useUser';
import { useRouter } from 'next/router';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [voiceSessionActive, setVoiceSessionActive] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [newSessionName, setNewSessionName] = useState('');
  const messagesEndRef = useRef(null);

  const { user, loading } = useUser();
  const router = useRouter();

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('default', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const fetchSessions = async () => {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(data);
  };

  const fetchMessages = async (sessionId) => {
    const res = await fetch(`/api/sessions/${sessionId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const handleSelectSession = async (session) => {
    setActiveSession(session);
    const res = await fetch(`/api/sessions/${session._id}/messages`);
    const data = await res.json();
    setMessages(data);
  };
  

  const handleAddSession = async () => {
  if (!newSessionName.trim()) {
    alert("Please enter a name for the session.");
    return;
  }

  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newSessionName }),
  });

  const data = await res.json();
  setNewSessionName('');
  setSessions([data, ...sessions]);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { sender: 'user', text: message, time: new Date() };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setMessage('');

    // Get AI response
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const data = await response.json();
    const botMsg = { sender: 'bot', text: data.response, time: new Date() };
    setMessages([...updatedMessages, botMsg]);

    // Only save if session is selected and user is logged in
    if (activeSession && user) {
      await fetch(`/api/sessions/${activeSession._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMsg),
      });

      await fetch(`/api/sessions/${activeSession._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botMsg),
      });
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div>Loading...</div>;

  if (voiceSessionActive) {
    return <VoiceSessionUI onExit={() => setVoiceSessionActive(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header user={user} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: '250px', background: '#f5f5f5', padding: '1rem', borderRight: '1px solid #ccc' }}>
          <h3>Conversations</h3>
          {user && (
            <>
              <input
                type="text"
                placeholder="New session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <button onClick={handleAddSession} style={{ width: '100%', marginBottom: '1rem' }}>
                + Add Session
              </button>
            </>
          )}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sessions.map((session) => (
                <li
                key={session._id}
                onClick={() => handleSelectSession(session)}
                style={{
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '5px',
                    background: activeSession?._id === session._id ? '#e6ddf8' : '#fff',
                    cursor: 'pointer'
                }}
                >
                {session.name && session.name.trim() !== '' ? session.name : 'Untitled Session'}
                </li>
            ))}
            </ul>

          <button
            onClick={() => setVoiceSessionActive(true)}
            style={{
              marginTop: '2rem',
              backgroundColor: '#9b59b6',
              border: 'none',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '10px'
            }}
          >
            🎙 Start Voice Session
          </button>
        </div>

        {/* Chat UI */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff0f5' }}>
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'user' ? '#d48fc2' : '#f2e1ec',
                    color: '#333',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    maxWidth: '70%',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.25rem', textAlign: 'right' }}>
                    {formatTime(new Date(msg.time))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #ccc' }}>
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={user ? (activeSession ? 'Type here...' : 'Select a session first') : 'Start chatting as a guest'}
              disabled={user && !activeSession}
              style={{
                flex: 1,
                resize: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            />
            <button
              type="submit"
              disabled={user && !activeSession}
              style={{
                marginLeft: '0.75rem',
                background: '#d48fc2',
                border: 'none',
                borderRadius: '8px',
                padding: '0 1rem',
                color: '#fff'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

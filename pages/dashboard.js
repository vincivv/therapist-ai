import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const router = useRouter();

  const fetchSessions = async () => {
    const res = await fetch('/api/sessions');
    try {
      const data = await res.json();
      console.log('Fetched sessions:', data);
  
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        console.error('Expected array, got:', data);
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to parse session data:', err);
      setSessions([]);
    }
  
    setLoading(false);
  };
  

  const createSession = async () => {
    if (!newSessionName.trim()) return;

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSessionName }),
    });

    if (res.ok) {
      const session = await res.json();
      setNewSessionName('');
      router.push(`/chat/${session._id}`); // ✅ redirect to session chat
    }
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
  };

  const startRenaming = (session) => {
    setEditingSessionId(session._id);
    setEditedName(session.name);
  };

  const handleRenameSession = async (id) => {
    if (!editedName.trim()) return;
    await fetch(`/api/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editedName }),
    });
    setEditingSessionId(null);
    fetchSessions();
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
    if (selectedSession?._id === id) setSelectedSession(null);
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <>
      <Header />
      <div style={{ display: 'flex', padding: '2rem' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', marginRight: '2rem' }}>
          <h3>Your Sessions</h3>
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="New session name"
            style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
          />
          <button onClick={createSession} style={{ width: '100%' }}>➕ Add Session</button>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {sessions.map((session) => (
              <li
                key={session._id}
                style={{
                  padding: '0.5rem',
                  background: selectedSession?._id === session._id ? '#e0f7fa' : '#f9f9f9',
                  marginBottom: '0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div
                  onClick={() => handleSelectSession(session)}
                  style={{ flex: 1 }}
                >
                  {editingSessionId === session._id ? (
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleRenameSession(session._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSession(session._id)}
                      autoFocus
                      style={{ width: '100%' }}
                    />
                  ) : (
                    session.name
                  )}
                </div>

                <div style={{ marginLeft: '0.5rem' }}>
                  <button onClick={() => startRenaming(session)} style={{ marginRight: '0.3rem' }}>✏️</button>
                  <button onClick={() => handleDeleteSession(session._id)}>🗑</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {selectedSession ? (
            <>
              <h2>Session: {selectedSession.name}</h2>
              <p>ID: {selectedSession._id}</p>
              <p>Created: {new Date(selectedSession.createdAt).toLocaleString()}</p>
              {/* Future: messages or chat view here */}
            </>
          ) : (
            <p>Select a session to view its details.</p>
          )}
        </div>
      </div>
    </>
  );
}

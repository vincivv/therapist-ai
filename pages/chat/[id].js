import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../../lib/useUser';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const { user } = useSession();  


  useEffect(() => {
    if (id) {
      fetch(`/api/sessions/${id}/messages`)
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages);
          setGuest(data.guest);
        })
        .catch(error => console.error('Error fetching messages:', error));
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    const message = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`/api/sessions/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: message },
        { sender: 'assistant', text: data.reply }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{guest ? 'Guest Session' : 'Your Session'}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender}>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 20px;
          background: #f0f0f0;
        }

        .chat-header {
          text-align: center;
          margin-bottom: 10px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: scroll;
          margin-bottom: 10px;
        }

        .chat-messages div {
          padding: 8px;
          margin: 5px 0;
          border-radius: 5px;
        }

        .user {
          background-color: #d3f8e2;
          text-align: right;
        }

        .assistant {
          background-color: #f2f2f2;
        }

        .chat-input {
          display: flex;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          padding: 10px;
        }

        .chat-input button {
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
        }

        .chat-input button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

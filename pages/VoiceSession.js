import { useEffect, useRef, useState } from 'react';
import '../styles/global.css';

export default function VoiceSession() {
  const [mode, setMode] = useState('idle'); // idle | listening | speaking
  const [error, setError] = useState('');
  const messagesRef = useRef([]); // store conversation history

  const useElevenLabs = true;

  const speakWithBrowser = (text) => {
    setMode('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setTimeout(() => startListening(), 1000);
    };
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    try {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setMode('listening');

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setError('');
        console.log("🎤 User said:", transcript);

        const userMsg = { sender: 'user', text: transcript };
        messagesRef.current.push(userMsg);

        const geminiRes = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesRef.current })
        });

        const geminiData = await geminiRes.json();
        const botReply = geminiData.response;
        const botMsg = { sender: 'bot', text: botReply };
        messagesRef.current.push(botMsg);

        if (useElevenLabs) {
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: botReply })
          });

          const { audioUrl } = await ttsRes.json();

          if (!audioUrl) {
            setError('No audio URL returned.');
            return;
          }

          setMode('speaking');
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            setTimeout(() => startListening(), 1000);
          };
          audio.play();
        } else {
          speakWithBrowser(botReply);
        }
      };

      recognition.onerror = (e) => {
        console.error("🎙️ Recognition error:", e);
        setError('Speech recognition error.');
        setTimeout(() => startListening(), 1500);
      };

      recognition.onend = () => {
        if (mode !== 'speaking') setMode('idle');
      };

      recognition.start();
    } catch (err) {
      setError('Speech recognition failed to start.');
    }
  };

  useEffect(() => {
    startListening();
  }, []);

  return (
    <div className="voice-session">
      <div className={`circle-pulse ${mode}`} />
      {error && <p className="error">{error}</p>}
      <button className="end-button" onClick={() => window.location.href = '/'}>
        End Voice Chat
      </button>
    </div>
  );
}

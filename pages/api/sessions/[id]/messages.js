import dbConnect from '../../../../lib/dbConnect';
import Session from '../../../../models/Session';
import { verifyToken } from '../../../../lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;

  if (!message || !id) {
    return res.status(400).json({ error: 'Missing message or session id' });
  }

  await dbConnect();

  // Check auth (cookie-based)
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth;
  const user = verifyToken(token);

  // Guest user: reply only, do not save
  if (!user) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const result = await response.json();
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn’t understand that.';

    return res.status(200).json({
      reply,
      guest: true
    });
  }

  // Logged-in user: update session with messages
  const session = await Session.findById(id);

  if (!session || session.userId.toString() !== user._id) {
    return res.status(403).json({ error: 'Unauthorized or session not found' });
  }

  // Store user message
  session.messages.push({ sender: 'user', text: message });

  // Call Gemini API
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }]
    })
  });

  const result = await response.json();
  const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn’t understand that.';

  // Store assistant reply
  session.messages.push({ sender: 'assistant', text: reply });
  await session.save();

  res.status(200).json({
    reply,
    guest: false
  });
}

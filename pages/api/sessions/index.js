import dbConnect from '../../../lib/dbConnect';
import Session from '../../../models/Session';
import cookie from 'cookie';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth;
  const user = verifyToken(token); 

  if (req.method === 'GET') {
    try {
      if (!user) {
        return res.status(200).json([]); 
      }

      const sessions = await Session.find({ userId: user._id }).sort({ createdAt: -1 });
      return res.status(200).json(sessions);
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching sessions' });
    }
  }


  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Session name is required' });

    if (!user) {
      return res.status(403).json({ message: 'Login required to save sessions' });
    }

    try {
      const newSession = new Session({
        name,
        userId: user._id,
      });

      await newSession.save();
      return res.status(201).json(newSession);
    } catch (err) {
      console.error('Failed to create session:', err);
      return res.status(500).json({ message: 'Error creating session' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

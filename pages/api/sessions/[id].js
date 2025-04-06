// pages/api/sessions/[id].js
import dbConnect from '@/lib/dbConnect';
import Session from '@/models/sessions';
import { verifyToken } from '@/lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth;

  let userId;
  try {
    const decoded = verifyToken(token);
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;


  if (req.method === 'PUT') {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
      const session = await Session.findOneAndUpdate(
        { _id: id, userId },
        { name },
        { new: true }
      );
      if (!session) return res.status(404).json({ message: 'Session not found' });

      return res.status(200).json(session);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to rename session' });
    }
  }


  if (req.method === 'DELETE') {
    try {
      const deleted = await Session.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ message: 'Session not found' });

      return res.status(200).json({ message: 'Session deleted' });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to delete session' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

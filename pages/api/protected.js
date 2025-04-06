import { verifyToken } from '../../lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth;

  const userData = verifyToken(token);
  if (!userData) return res.status(401).json({ message: 'Unauthorized' });

  res.status(200).json({ message: 'Welcome back!', userId: userData.userId });
}

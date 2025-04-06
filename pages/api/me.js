// pages/api/me.js
import { verifyToken } from '../../lib/auth';
import cookie from 'cookie';

export default function handler(req, res) {
  const { auth } = cookie.parse(req.headers.cookie || '');

  try {
    const user = verifyToken(auth);
    res.status(200).json({ user });
  } catch {
    res.status(401).json({ user: null });
  }
}

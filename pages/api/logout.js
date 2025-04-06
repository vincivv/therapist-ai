import cookie from 'cookie';

export default function handler(req, res) {
  // Clear the auth cookie
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'strict',
      path: '/',
    })
  );

  // Respond with redirect instruction
  res.status(200).json({ message: 'Logged out' });
}

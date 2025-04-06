import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export function signToken(user) {
    return jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
  }
  

  export function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, secret);
  
      if (!decoded._id && decoded.id) {
        decoded._id = decoded.id;
      }
  
      return decoded;
    } catch {
      return null;
    }
  }
  
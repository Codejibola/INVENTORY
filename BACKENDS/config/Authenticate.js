import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Log the verification error to help debug: expired, malformed, or signature mismatch
      // Avoid logging full token to prevent leaking secrets in logs.
      console.warn('Auth middleware: token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.id;    
    next();
  });
};

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: missing Authorization header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({ message: "Unauthorized: invalid Authorization format" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  // NOTE: This is a placeholder. Replace with real verification (JWT verify, session lookup, etc.).
  // For now we attach a minimal `user` object so downstream handlers have `req.user`.
  req.user = { id: token };
  next();
}

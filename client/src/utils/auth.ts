import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export interface AuthContext {
  user?: JwtPayload | string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let token = req.headers.authorization;

  if (token) {
    // Remove "Bearer " from the token string if present
    token = token.split(' ')[1];
  }

  if (!token) {
    req.user = undefined; // No token; user is not authenticated
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decodedToken; // Attach user data to request
  } catch (err) {
    console.error('Invalid token:', err.message);
    req.user = undefined;
  }

  return next();
};

// Context creation function for Apollo Server
export const createContext = ({ req }: { req: Request }): AuthContext => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return { user: undefined };
  }

  try {
    const decodedToken = jwt.verify(token, SECRET_KEY);
    return { user: decodedToken };
  } catch (err) {
    console.error('Invalid token in context:', err.message);
    return { user: undefined };
  }
};


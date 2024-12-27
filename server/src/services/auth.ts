import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

// Middleware for authenticating REST requests
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const secretKey = process.env.JWT_SECRET_KEY || '';

  if (!authHeader) {
    res.sendStatus(401); // Unauthorized
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      res.sendStatus(403); // Forbidden
      return;
    }

    req.user = user as JwtPayload; // Attach user to request
    next();
  });
};

// Utility function to sign a new token
export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Function to authenticate GraphQL requests via context
export const authenticateGraphQL = (authHeader?: string): JwtPayload | null => {
  const secretKey = process.env.JWT_SECRET_KEY || '';

  if (!authHeader) {
    return null; // No token, user is not authenticated
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    return user; // Return decoded user
  } catch (err) {
    console.error('Invalid token:', err.message);
    return null; // Invalid or expired token
  }
};

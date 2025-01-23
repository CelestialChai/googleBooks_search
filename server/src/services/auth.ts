import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  console.error('Error: JWT_SECRET_KEY is not defined in environment variables.');
  throw new Error('JWT_SECRET_KEY is required but not defined.');
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    console.error('Authorization header is missing.');
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }
};

export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };

  try {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    console.log('Token successfully signed:', token);
    return token;
  } catch (err) {
    console.error('Error signing token:', (err as Error).message);
    throw new Error('Failed to sign token.');
  }
};

export const authenticateGraphQL = (authHeader: string): JwtPayload | null => {
  if (!authHeader) {
    console.error('Authorization header is missing in GraphQL context.');
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    console.log('Token successfully verified for GraphQL context.');
    return decoded;
  } catch (err) {
    console.error('Error verifying token in GraphQL context:', (err as Error).message);
    return null;
  }
};
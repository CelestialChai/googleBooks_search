import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authenticateGraphQL = (authHeader?: string): JwtPayload | null => {
  const secretKey = process.env.JWT_SECRET_KEY || '';

  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    return user;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Invalid token:', err.message);
    } else {
      console.error('Unknown error occurred during token verification');
    }
    return null;
  }
};

export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export interface AuthContext {
  user?: JwtPayload | string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let token = req.headers.authorization;

  if (token) {
    token = token.split(' ')[1];
  }

  if (!token) {
    (req as any).user = undefined;
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
    (req as any).user = decodedToken;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Invalid token:', err.message);
    } else {
      console.error('An unknown error occurred during token verification');
    }
    (req as any).user = undefined;
  }

  return next();
};

export const createContext = ({ req }: { req: Request }): AuthContext => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return { user: undefined };
  }

  try {
    const decodedToken = jwt.verify(token, SECRET_KEY);
    return { user: decodedToken };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Invalid token in context:', err.message);
    } else {
      console.error('An unknown error occurred during token verification in context');
    }
    return { user: undefined };
  }
};

const Auth = { authMiddleware, createContext };

export default Auth;
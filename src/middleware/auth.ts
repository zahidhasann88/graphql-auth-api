// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';

// Express middleware version
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization'];
  
  if (!authorization) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, JWT_SECRET);
    (req as any).payload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
};

// GraphQL middleware version
export const isAuthGql = ({ context }: any, next: any) => {
  const authorization = context.req.headers['authorization'];
  
  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, JWT_SECRET);
    context.payload = payload as any;
  } catch (err) {
    throw new Error('Not authenticated');
  }

  return next();
};
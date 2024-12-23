import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { MyContext } from '../types/MyContext';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (err) {
    throw new Error('Not authenticated');
  }

  return next();
};

export const validateAuthInputs = (email: string, password: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
};
// middleware/roles.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';

export const CheckRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).payload?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const hasRole = user.roles.some(role => roles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// GraphQL version
export const CheckRoleGql = (roles: string[]) => {
  return async ({ context }: any, next: any) => {
    const userId = context.payload?.userId;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const hasRole = user.roles.some(role => roles.includes(role));
    if (!hasRole) {
      throw new Error('Not authorized');
    }

    return next();
  };
};
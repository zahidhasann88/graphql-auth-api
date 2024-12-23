import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/MyContext';
import { User } from '../entities/User';

export const CheckRole = (roles: string[]): MiddlewareFn<MyContext> => async ({ context }, next) => {
  if (!context.payload?.userId) {
    throw new Error('Not authenticated');
  }

  const user = await User.findOne({ where: { id: context.payload.userId } });
  if (!user || !roles.some(role => user.roles.includes(role))) {
    throw new Error('Not authorized');
  }

  return next();
};
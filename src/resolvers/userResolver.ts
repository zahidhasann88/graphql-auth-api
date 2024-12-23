// resolvers/UserResolver.ts
import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { User } from '../entities/User';
import { CheckRole } from '../middleware/roles';
import { isAuth } from '../middleware/auth';

@Resolver()
export class UserResolver {
  @Query(() => [User])
  @UseMiddleware(isAuth, CheckRole(['ADMIN']))
  async users(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User)
  @UseMiddleware(isAuth, CheckRole(['ADMIN']))
  async user(@Arg('id') id: number): Promise<User> {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, CheckRole(['ADMIN']))
  async updateUserRoles(
    @Arg('userId') userId: number,
    @Arg('roles', () => [String]) roles: string[]
  ): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    user.roles = roles;
    await user.save();
    return true;
  }
}
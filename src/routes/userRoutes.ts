import express from 'express';
import { User } from './../entities/User';
import { isAuth } from './../middleware/auth';
import { CheckRole } from './../middleware/roles';

const userRouter = express.Router();

// Get all users (Admin only)
userRouter.get('/users', isAuth, CheckRole(['ADMIN']), async (req, res) => {
  const users = await User.find();
  return res.json(users);
});

// Get a single user (Admin only)
userRouter.get('/user/:id', isAuth, CheckRole(['ADMIN']), async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

// Update user roles (Admin only)
userRouter.patch('/updateUserRoles', isAuth, CheckRole(['ADMIN']), async (req, res) => {
  const { userId, roles } = req.body;
  const user = await User.findOne({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.roles = roles;
  await user.save();
  return res.json({ message: 'User roles updated successfully' });
});

export { userRouter };

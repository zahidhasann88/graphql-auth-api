import express from "express";
import { UserResolver } from "./../resolvers/userResolver";
import { isAuth } from "../middleware/auth";
import { CheckRole } from "../middleware/roles";

const userRouter = express.Router();
const userResolver = new UserResolver();

// Error handler middleware
const errorHandler = (error: any, res: express.Response) => {
  console.error("Error:", error);
  if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "An unexpected error occurred" });
};

// Get all users (Admin only)
userRouter.get(
  "/users",
  isAuth,
  CheckRole(["ADMIN"]),
  async (_req, res) => {
    try {
      const users = await userResolver.users();
      return res.json(users);
    } catch (error) {
      return errorHandler(error, res);
    }
  }
);

// Get single user by ID (Admin only)
userRouter.get(
  "/user/:id",
  isAuth,
  CheckRole(["ADMIN"]),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await userResolver.user(userId);
      return res.json(user);
    } catch (error) {
      return errorHandler(error, res);
    }
  }
);

// Update user roles (Admin only)
userRouter.patch(
  "/update-roles",
  isAuth,
  CheckRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { userId, roles } = req.body;
      if (!userId || !roles || !Array.isArray(roles)) {
        return res.status(400).json({ error: "User ID and roles array are required" });
      }

      const success = await userResolver.updateUserRoles(userId, roles);
      return res.json({ success });
    } catch (error) {
      return errorHandler(error, res);
    }
  }
);

export { userRouter };
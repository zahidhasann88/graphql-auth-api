import express from "express";
import { AuthResolver } from "./../resolvers/authResolver";
import { MyContext } from "../types/MyContext";
import { isAuth } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimit";

const authRouter = express.Router();
const authResolver = new AuthResolver();

// Middleware to create context
const createContext = (
  req: express.Request,
  res: express.Response
): MyContext => ({
  req,
  res,
  payload: (req as any).payload,
});

// Error handler middleware
const errorHandler = (error: any, res: express.Response) => {
  console.error("Error:", error);
  if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "An unexpected error occurred" });
};

// Login endpoint with rate limiting
authRouter.post("/login", rateLimitMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const response = await authResolver.login(
      email,
      password,
      createContext(req, res)
    );
    return res.json(response);
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Register endpoint with rate limiting
authRouter.post("/register", rateLimitMiddleware, async (req, res) => {
  try {
    const response = await authResolver.register(req.body);
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Protected logout endpoint
authRouter.post("/logout", isAuth, async (req, res) => {
  try {
    const response = await authResolver.logout(createContext(req, res));
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Protected current user endpoint
authRouter.get("/me", isAuth, async (req, res) => {
  try {
    const response = await authResolver.me(createContext(req, res));
    if (!response) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(response);
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Password reset request endpoint
authRouter.post("/forgot-password", rateLimitMiddleware, async (req, res) => {
  try {
    const response = await authResolver.forgotPassword(req.body.email);
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Password reset endpoint
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const response = await authResolver.resetPassword(token, newPassword);
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Email verification endpoint
authRouter.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const response = await authResolver.verifyEmail(token);
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Google authentication endpoint
authRouter.post("/google-auth", rateLimitMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Google token is required" });
    }

    const response = await authResolver.googleAuth(
      token,
      createContext(req, res)
    );
    return res.json(response);
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Protected password change endpoint
authRouter.post("/change-password", isAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    const response = await authResolver.changePassword(
      currentPassword,
      newPassword,
      createContext(req, res)
    );
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Protected email change endpoint
authRouter.post("/change-email", isAuth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return res
        .status(400)
        .json({ error: "New email and password are required" });
    }

    const response = await authResolver.changeEmail(
      newEmail,
      password,
      createContext(req, res)
    );
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Protected account deletion endpoint
authRouter.post("/delete-account", isAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const response = await authResolver.deleteAccount(
      password,
      createContext(req, res)
    );
    return res.json({ success: response });
  } catch (error) {
    return errorHandler(error, res);
  }
});

authRouter.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (!token) {
      return res.status(401).json({ error: "Refresh token is required" });
    }

    const response = await authResolver.refreshToken(token, {
      req,
      res,
      payload: undefined,
    });

    return res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(401).json({ error: "An unknown error occurred" });
  }
});

export { authRouter };

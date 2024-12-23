import express from "express";
import { AuthResolver } from "./../resolvers/authResolver";
import { MyContext } from "../types/MyContext";

const router = express.Router();
const authResolver = new AuthResolver();

// Middleware to simulate `MyContext`
const createContext = (req: any, res: any): MyContext => ({
  req,
  res,
  payload: req.payload,
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await authResolver.login(
      email,
      password,
      createContext(req, res)
    );
    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const response = await authResolver.register(req.body);
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const response = await authResolver.logout(createContext(req, res));
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Current User
router.get("/me", async (req, res) => {
  try {
    const response = await authResolver.me(createContext(req, res));
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const response = await authResolver.forgotPassword(req.body.email);
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const response = await authResolver.resetPassword(token, newPassword);
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
  try {
    const response = await authResolver.verifyEmail(req.body.token);
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Google Auth
router.post("/google-auth", async (req, res) => {
  try {
    const response = await authResolver.googleAuth(
      req.body.token,
      createContext(req, res)
    );
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change Password
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const response = await authResolver.changePassword(
      currentPassword,
      newPassword,
      createContext(req, res)
    );
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change Email
router.post("/change-email", async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const response = await authResolver.changeEmail(
      newEmail,
      password,
      createContext(req, res)
    );
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Account
router.post("/delete-account", async (req, res) => {
  try {
    const response = await authResolver.deleteAccount(
      req.body.password,
      createContext(req, res)
    );
    res.json({ success: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.post("/refresh-token", async (req, res) => {
//     try {
//       const token = req.cookies.jid; // Assuming you store the refresh token in cookies
//       const response = await authResolver.refreshToken(token, res);
//       res.json(response);
//     } catch (error) {
//       if (error instanceof Error) {
//         res.status(401).json({ error: error.message });
//       } else {
//         res.status(401).json({ error: "An unknown error occurred" });
//       }
//     }
//   });

export default router;

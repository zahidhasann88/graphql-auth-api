// middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/MyContext";

declare global {
  var loginAttempts: Map<string, number>;
}

if (!global.loginAttempts) {
  global.loginAttempts = new Map();
}

// Express middleware version
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const key = `login:${ip}`;

  const attempts = global.loginAttempts.get(key) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }

  global.loginAttempts.set(key, attempts + 1);
  setTimeout(() => global.loginAttempts.delete(key), 15 * 60 * 1000);

  next();
};

// GraphQL middleware version
export const rateLimitMiddlewareGql: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const ip = context.req.ip;
  const key = `login:${ip}`;

  const attempts = global.loginAttempts.get(key) || 0;
  if (attempts >= 5) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  global.loginAttempts.set(key, attempts + 1);
  setTimeout(() => global.loginAttempts.delete(key), 15 * 60 * 1000);

  return next();
};
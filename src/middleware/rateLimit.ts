import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/MyContext";

declare global {
  var loginAttempts: Map<string, number>;
}

if (!global.loginAttempts) {
  global.loginAttempts = new Map();
}

export const rateLimitMiddleware: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
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

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100
// });

// export const rateLimitMiddleware: MiddlewareFn<MyContext> = ({ context }, next) => {
//   return new Promise((resolve, reject) => {
//     limiter(context.req, context.res, (err: any) => {
//       if (err) reject(err);
//       resolve(next());
//     });
//   });
// };
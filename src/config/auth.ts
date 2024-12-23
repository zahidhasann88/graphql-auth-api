import jwt from "jsonwebtoken";
import { Response } from "express";

export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const createTokens = (userId: number, tokenVersion: number) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(
    { userId, tokenVersion },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/refresh_token",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

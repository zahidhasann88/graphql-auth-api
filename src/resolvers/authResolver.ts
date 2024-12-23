import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Query,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types/MyContext";
import { createTokens, REFRESH_TOKEN_SECRET, sendRefreshToken } from "../config/auth";
import { isAuth } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { LoginResponse } from "../types/LoginResponse";
import { RegisterInput } from "../types/RegisterInput";
import { sendEmail } from "../config/email";
import { MoreThan } from "typeorm";
import { randomBytes, verify } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { hash } from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Resolver()
export class AuthResolver {
  @Mutation(() => LoginResponse)
  @UseMiddleware(rateLimitMiddleware)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.verified) {
      throw new Error("Invalid credentials or unverified account");
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = createTokens(
      user.id,
      user.tokenVersion
    );
    sendRefreshToken(res, refreshToken);

    return { accessToken, user };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("input") { email, password, name }: RegisterInput
  ): Promise<boolean> {
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const verificationToken = randomBytes(32).toString("hex");
      const user = await User.create({
        email,
        name,
        password: await hash(password, 12),
        verificationToken,
        roles: ["USER"],
        verified: false,
      }).save();

      await sendEmail(
        email,
        "Verify Your Email",
        `Click here to verify your email: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
      );

      return true;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async logout(@Ctx() { res }: MyContext): Promise<boolean> {
    sendRefreshToken(res, "");
    return true;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() { payload }: MyContext): Promise<User | null> {
    if (!payload?.userId) return null;
    return User.findOne({ where: { id: payload.userId } });
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) return true;

    const token = randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendEmail(
      email,
      "Password Reset",
      `Click here to reset your password: ${process.env.FRONTEND_URL}/reset-password/${token}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ): Promise<boolean> {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
    if (!user) throw new Error("Invalid or expired reset token");

    user.password = await user.hashPassword(newPassword);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date();
    user.tokenVersion += 1;
    await user.save();

    return true;
  }

  @Mutation(() => Boolean)
  async verifyEmail(@Arg("token") token: string): Promise<boolean> {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) throw new Error("Invalid verification token");

    user.verified = true;
    user.verificationToken = "";
    await user.save();

    return true;
  }

  @Mutation(() => LoginResponse)
  async googleAuth(
    @Arg("token") token: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Invalid Google token");

    let user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name || "",
        googleId: payload.sub,
        verified: true,
        password: randomBytes(32).toString("hex"),
      }).save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const { accessToken, refreshToken } = createTokens(
      user.id,
      user.tokenVersion
    );
    sendRefreshToken(res, refreshToken);

    return { accessToken, user };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async changePassword(
    @Arg("currentPassword") currentPassword: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { payload }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { id: payload!.userId } });
    if (!user) throw new Error("User not found");

    const valid = await user.validatePassword(currentPassword);
    if (!valid) throw new Error("Current password is incorrect");

    user.password = await user.hashPassword(newPassword);
    user.tokenVersion += 1;
    await user.save();

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async changeEmail(
    @Arg("newEmail") newEmail: string,
    @Arg("password") password: string,
    @Ctx() { payload }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { id: payload!.userId } });
    if (!user) throw new Error("User not found");

    const valid = await user.validatePassword(password);
    if (!valid) throw new Error("Password is incorrect");

    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) throw new Error("Email already in use");

    const verificationToken = randomBytes(32).toString("hex");
    user.newEmail = newEmail;
    user.verificationToken = verificationToken;
    await user.save();

    await sendEmail(
      newEmail,
      "Verify Your New Email",
      `Click here to verify your new email: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAccount(
    @Arg("password") password: string,
    @Ctx() { payload, res }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { id: payload!.userId } });
    if (!user) throw new Error("User not found");

    const valid = await user.validatePassword(password);
    if (!valid) throw new Error("Password is incorrect");

    await user.remove();
    sendRefreshToken(res, "");
    return true;
  }

  
}

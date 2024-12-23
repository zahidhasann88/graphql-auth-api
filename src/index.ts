import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { json } from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { verify } from 'jsonwebtoken';
import { AppDataSource } from "./config/database";
import { createSchema } from "./schema/typeDefs";
// import { User } from './entities/User';
// import { createTokens, REFRESH_TOKEN_SECRET, sendRefreshToken } from './config/auth';
import { authRouter } from "./routes/authRoutes";
import { userRouter } from "./routes/userRoutes";

async function bootstrap() {
  try {
    const app = express();

    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const schema = await createSchema();
    const server = new ApolloServer({
      schema,
    });

    await server.start();

    app.use(cookieParser());
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );

    // Refresh token endpoint
    // app.post('/refresh_token', async (req, res) => {
    //   const token = req.cookies.jid;
    //   if (!token) {
    //     return res.send({ ok: false, accessToken: '' });
    //   }

    //   let payload: any = null;
    //   try {
    //     payload = verify(token, REFRESH_TOKEN_SECRET);
    //   } catch (err) {
    //     return res.send({ ok: false, accessToken: '' });
    //   }

    //   const user = await User.findOne({ where: { id: payload.userId } });
    //   if (!user) {
    //     return res.send({ ok: false, accessToken: '' });
    //   }

    //   if (user.tokenVersion !== payload.tokenVersion) {
    //     return res.send({ ok: false, accessToken: '' });
    //   }

    //   const { accessToken, refreshToken } = createTokens(user.id, user.tokenVersion);
    //   sendRefreshToken(res, refreshToken);

    //   return res.send({ ok: true, accessToken });
    // });

    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    app.use(
      "/graphql",
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => ({ req, res }),
      })
    );

    app.listen(4000, () => {
      console.log("🚀 Server ready at http://localhost:4000/graphql");
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

bootstrap();

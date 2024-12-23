import { buildSchema } from "type-graphql";
import { UserResolver } from "../resolvers/userResolver";

export const createSchema = () =>
  buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
  });
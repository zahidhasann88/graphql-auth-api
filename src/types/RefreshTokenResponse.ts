// types/RefreshTokenResponse.ts
import { ObjectType, Field } from "type-graphql";
import { User } from "../entities/User";

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  accessToken!: string;

  @Field(() => User)
  user!: User;

  @Field()
  ok!: boolean;
}
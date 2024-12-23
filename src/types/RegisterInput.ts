import { InputType, Field } from 'type-graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(6)
  password!: string;

  @Field()
  name!: string;
}
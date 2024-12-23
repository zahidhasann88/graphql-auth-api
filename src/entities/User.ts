import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { hash, compare } from "bcryptjs";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column("int", { default: 0 })
  tokenVersion!: number;

  @Column({ default: false })
  verified!: boolean;

  @Column({ nullable: true })
  verificationToken!: string;

  @Column({ nullable: true })
  resetPasswordToken!: string;

  @Column({ nullable: true })
  resetPasswordExpires!: Date;

  @Column("simple-array", { default: "USER" })
  roles!: string[];

  @Column({ nullable: true })
  googleId!: string;

  @Column({ nullable: true })
  githubId!: string;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  newEmail!: string;

  async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  async validatePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  }
}

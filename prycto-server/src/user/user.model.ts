import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field((type) => ID)
  _id: string;

  @Field()
  email: string;

  @Field(() => [String])
  tokens: string[];

  @Field()
  password: string;

  @Field(() => Float)
  createdAt: number;

  @Field()
  lang: string;
}

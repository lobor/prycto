import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Predict {
  @Field((type) => ID)
  _id: string;

  @Field(() => Float)
  up: string;

  @Field(() => String)
  pair: string;

  @Field(() => Float)
  down: string;

  @Field(() => Float)
  predictDate: string;

  @Field(() => Boolean)
  verified?: boolean;
}

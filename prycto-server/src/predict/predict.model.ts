import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Predict {
  @Field(() => Float)
  up: string;

  @Field(() => Float)
  down: string;
}

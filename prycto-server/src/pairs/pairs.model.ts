import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Pair {
  @Field()
  symbol: string;
}

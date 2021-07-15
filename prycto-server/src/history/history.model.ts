import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class History {
  // @Field((type) => ID)
  // _id: string;

  @Field()
  symbol: string;

  @Field()
  exchangeId: string;

  @Field(() => Number)
  timestamp: number;

  @Field()
  type: string;

  @Field()
  side: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  cost: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  filled: number;

  @Field(() => Float)
  remaining: number;

  @Field()
  status: string;
}

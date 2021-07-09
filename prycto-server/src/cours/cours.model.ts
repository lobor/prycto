import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Cours {
  @Field((type) => ID)
  _id: string;

  @Field()
  symbol: string;

  @Field()
  exchangeId: string;

  @Field(() => Number)
  timestamp: number;

  @Field(() => Float)
  open: number;

  @Field(() => Float)
  hight: number;

  @Field(() => Float)
  low: number;

  @Field(() => Float)
  close: number;

  @Field(() => Float)
  volume: number;
}

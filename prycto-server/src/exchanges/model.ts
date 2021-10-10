import { Field, ID, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';

export type Balance = Record<string, { locked: number; available: number }>;
@ObjectType()
export class Exchange {
  @Field((type) => ID)
  _id: string;

  @Field()
  exchange: string;

  @Field()
  name: string;

  @Field()
  publicKey: string;

  @Field()
  secretKey: string;

  @Field()
  address: string;

  @Field((type) => JSON, { nullable: true })
  balance: Balance;
}

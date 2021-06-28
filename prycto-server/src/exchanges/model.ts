import { Field, ID, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';

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

  @Field((type) => JSON)
  balance: Record<string, { locked: number; available: number }>;
}

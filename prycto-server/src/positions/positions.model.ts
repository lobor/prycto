import { Field, ID, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { Predict } from '../predict/predict.model';

@ObjectType()
export class Position {
  @Field((type) => ID)
  _id: string;

  @Field()
  pair: string;

  @Field()
  investment: number;

  @Field()
  exchangeId: string;

  @Field()
  exchange: string;

  @Field({ nullable: true })
  objectif?: number;

  @Field({ nullable: true })
  available?: number;

  @Field({ nullable: true })
  locked?: number;

  @Field({ nullable: true })
  address?: string;

  @Field(() => JSON)
  balance?: Record<string, number>;

  @Field(() => Predict)
  predict?: Predict;
}

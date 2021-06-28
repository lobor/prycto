import { Field, ID, ObjectType } from '@nestjs/graphql';

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

  @Field({ nullable: true })
  objectif?: number;

  @Field({ nullable: true })
  available?: number;

  @Field({ nullable: true })
  locked?: number;
}

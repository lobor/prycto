import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({
  collection: 'position',
})
export class Position {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  pair: string;

  @Prop({ type: Number, required: true })
  investment: number;

  @Prop({ required: true })
  exchangeId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: Number })
  objectif: number;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

export const PositionImport = MongooseModule.forFeature([
  { name: Position.name, schema: PositionSchema },
]);

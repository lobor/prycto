import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type CoursDocument = Cours & Document;

@Schema({
  collection: 'cours',
})
export class Cours {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop()
  symbol: string;

  @Prop({ required: true })
  exchangeId: string;

  @Prop({ required: true, type: Number })
  timestamp: number;

  @Prop({ required: true, type: Number })
  open: number;

  @Prop({ required: true, type: Number })
  hight: number;

  @Prop({ required: true, type: Number })
  low: number;

  @Prop({ required: true, type: Number })
  close: number;

  @Prop({ required: true, type: Number })
  volume: number;
}

export const CoursSchema = SchemaFactory.createForClass(Cours);

export const CoursImport = MongooseModule.forFeature([
  { name: Cours.name, schema: CoursSchema },
]);

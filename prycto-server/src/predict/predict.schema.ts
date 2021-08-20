import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type PredictDocument = Predict & Document;

@Schema({
  collection: 'predict',
})
export class Predict {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  up: string;

  @Prop({ required: true })
  down: string;

  @Prop({ type: Number, required: true })
  createdAt: number;

  @Prop({ type: Number, required: true })
  predictDate: number;

  @Prop({ required: true })
  pair: string;
}

export const PredictSchema = SchemaFactory.createForClass(Predict);

export const PredictImport = MongooseModule.forFeature([
  { name: Predict.name, schema: PredictSchema },
]);

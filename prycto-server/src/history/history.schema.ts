import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type HistoryDocument = History & Document;

@Schema({
  collection: 'history',
})
export class History {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ type: Object })
  info: Record<string, unknown>;

  @Prop()
  id: string;

  @Prop()
  clientOrderId: string;

  @Prop({ required: true, type: Number })
  timestamp: number;

  @Prop()
  datetime: string;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  type: string;

  @Prop()
  timeInForce: string;

  @Prop()
  postOnly: false;

  @Prop()
  side: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  cost: number;

  @Prop({ type: Number })
  average: number;

  @Prop({ required: true, type: Number })
  filled: number;

  @Prop({ required: true, type: Number })
  remaining: number;

  @Prop()
  status: string;

  @Prop({ type: Number })
  fee: null;

  @Prop()
  trades: [];

  @Prop()
  fees: [];

  @Prop({ required: true })
  exchangeId: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);

export const HistoryImport = MongooseModule.forFeature([
  { name: History.name, schema: HistorySchema },
]);

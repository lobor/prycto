import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type ExchangeDocument = Exchange & Document;

@Schema({
  collection: 'exchange',
})
export class Exchange {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop()
  exchange: string;

  @Prop()
  name: string;

  @Prop()
  publicKey: string;

  @Prop()
  secretKey: string;

  @Prop({ type: Object })
  balance: Record<string, { locked: number; available: number }>;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);

export const ExchangeImport = MongooseModule.forFeature([
  { name: Exchange.name, schema: ExchangeSchema },
]);

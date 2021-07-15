import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'user',
})
export class User {
  @Prop({ type: SchemaMongoose.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: Number })
  createdAt: number;

  @Prop({ required: true, type: [String] })
  tokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserImport = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

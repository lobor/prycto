import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exchange, ExchangeDocument } from './exchange.schema';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectModel(Exchange.name)
    private readonly exchangeModel: Model<ExchangeDocument>,
  ) {}

  async findById(_id: string): Promise<ExchangeDocument> {
    return this.exchangeModel.findById(Types.ObjectId(_id));
  }

  async findAll(): Promise<Exchange[]> {
    return this.exchangeModel.find().exec();
  }
}

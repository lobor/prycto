import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
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

  async findAll(): Promise<ExchangeDocument[]> {
    return this.exchangeModel.find().exec();
  }

  async insertOne(
    exchange: Omit<Exchange, '_id' | 'balance'>,
  ): Promise<Exchange> {
    const exchangeModel = new this.exchangeModel(exchange);
    await exchangeModel.save();
    return exchangeModel.toJSON();
  }

  async updateOneById(
    _id: string,
    exchange: UpdateQuery<ExchangeDocument>,
  ): Promise<Exchange> {
    const exchangeSaved = await this.exchangeModel
      .findByIdAndUpdate({ _id }, { $set: exchange }, { new: true })
      .exec();
    return exchangeSaved.toJSON();
  }

  async removeOne(_id: string): Promise<boolean> {
    await this.exchangeModel.deleteOne({ _id });
    return true;
  }
}

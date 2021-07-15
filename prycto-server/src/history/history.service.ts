import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from './history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
  ) {}
  getBySymbolAndExchange(
    exchangeId: string,
    symbol: string,
  ): Promise<HistoryDocument[]> {
    return this.historyModel.find({ exchangeId, symbol }).exec();
  }
}

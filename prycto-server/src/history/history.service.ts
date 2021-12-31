import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { keyBy } from 'lodash';
import { Model } from 'mongoose';
import { CcxtService } from 'src/ccxt/ccxt.service';
import { History, HistoryDocument } from './history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
    private readonly ccxtService: CcxtService,
  ) {}
  getBySymbolAndExchange(
    exchangeId: string,
    symbol: string,
  ): Promise<HistoryDocument[]> {
    return this.historyModel.find({ exchangeId, symbol }).exec();
  }

  createMany(histories: HistoryDocument[]): Promise<HistoryDocument[]> {
    return this.historyModel.insertMany(histories);
  }

  async syncBySymbolAndExchange(
    exchangeId: string,
    symbol: string,
  ): Promise<void> {
    const histories = await this.getBySymbolAndExchange(exchangeId, symbol);
    const orders = await this.ccxtService.getOrderBySymbolByExchangeId({
      exchangeId,
      pairs: [symbol],
    });

    const historiesById = keyBy(histories, 'id');

    const { toCreate, toUpdate } = orders.reduce(
      (acc, order) => {
        if (
          historiesById[order.id] &&
          historiesById[order.id].status !== order.status
        ) {
          acc.toUpdate.push(order);
        } else {
          console.log(order)
          acc.toCreate.push({ ...order, exchangeId });
        }
        return acc;
      },
      { toUpdate: [], toCreate: [] },
    );

    await Promise.all(
      toUpdate.map((order) => {
        return this.historyModel.updateOne({ id: order.id }, { $set: order });
      }),
    );

    await this.createMany(toCreate);
  }
}

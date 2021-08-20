import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isSameDay, subDays } from 'date-fns';
import { keyBy } from 'lodash';
import { Model, Query } from 'mongoose';
import { AppService } from '../app.service';
import { Cours, CoursDocument } from './cours.schema';

@Injectable()
export class CoursService {
  constructor(
    @InjectModel(Cours.name)
    private readonly coursModel: Model<CoursDocument>,
    private readonly appService: AppService,
  ) {}

  findByExchangeIdAndSymbol(
    _id: string,
    symbol,
    sort?: any,
  ): Query<CoursDocument[], CoursDocument, Record<string, unknown>> {
    const query = this.coursModel.find({ exchangeId: _id, symbol });
    if (sort) {
      query.sort(sort);
    }
    return query;
  }

  async syncCoursHistory(exchangeId: string, symbol: string, limit: number) {
    const cours = await this.findByExchangeIdAndSymbol(exchangeId, symbol)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();

    if (
      cours.length === 0 ||
      !isSameDay(new Date(cours[0].timestamp), subDays(new Date(), 1))
    ) {
      try {
        const coursByTimestamp = keyBy(cours, 'timestamp');
        const coursNotHave = (
          await this.appService.fetchOHLCV(
            exchangeId,
            symbol,
            '1d',
            (cours[0] && cours[0].timestamp + 1) || undefined,
          )
        ).map(([timestamp, open, hight, low, close, volume]) => ({
          symbol,
          timestamp,
          open,
          hight,
          low,
          close,
          volume,
          exchangeId,
        }));

        const toSave = coursNotHave.filter(
          ({ timestamp }: any) =>
            !coursByTimestamp[timestamp] &&
            !isSameDay(new Date(timestamp), new Date()),
        );

        if (toSave.length > 0) {
          await this.insertMany(toSave);
        }

        return this.findByExchangeIdAndSymbol(exchangeId, symbol)
          .limit(limit)
          .sort({ timestamp: -1 })
          .exec();
      } catch (e) {}
    }
    return cours;
  }

  insertMany(doc: Omit<Cours, '_id'>[]) {
    return this.coursModel.insertMany(doc);
  }
}

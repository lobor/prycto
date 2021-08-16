import { Args, Query, Resolver } from '@nestjs/graphql';
import { RSI, MACD, EMA } from 'trading-signals';
import { CoursService } from 'src/cours/cours.service';
import { AppService } from 'src/app.service';
import { NotFoundException } from '@nestjs/common';
import * as neuro from 'limdu';
import { addDays } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Cours, CoursDocument } from 'src/cours/cours.schema';
import { Model } from 'mongoose';
import { Predict } from './predict.model';

@Resolver(() => Predict)
export class PredictResolver {
  constructor(
    @InjectModel(Cours.name)
    private readonly coursModel: Model<CoursDocument>,
    private readonly coursService: CoursService,
    private readonly appService: AppService,
  ) {}

  @Query(() => Predict)
  async predict(
    @Args('exchangeId') exchangeId: string,
    @Args('symbol') symbol: string,
  ): Promise<Predict> {
    await this.coursService.syncCoursHistory(exchangeId, symbol, 110);
    const cours = (
      await this.coursModel
        .find({ exchangeId, symbol })
        .sort({ timestamp: 1 })
        .exec()
    );
    const foo = await this.appService.getCurrenciesByPair({
      exchangeId: exchangeId,
      symbol,
    });
    if (!foo.pairs[symbol]) {
      throw new NotFoundException();
    }
    const toto: { close: number; timestamp: number }[][] = [];
    [
      ...cours,
      { close: foo.pairs[symbol].close, timestamp: Date.now() },
    ].forEach((cour) => {
      const last = toto[toto.length - 1] || [];
      toto.push([...last, cour]);
    });
    console.log('calculate indicator');
    const toTrains = toto
      .map((coursClose) => {
        try {
          const rsi = new RSI(14);
          const macd = new MACD({
            longInterval: 26,
            shortInterval: 12,
            signalInterval: 9,
            indicator: EMA,
          });
          let lastClose = 0;
          let last = 0;
          coursClose.forEach(({ close, timestamp }) => {
            rsi.update(close);
            macd.update(close);
            lastClose = close;
            last = timestamp;
          });
          const macdResult = macd.getResult();
          const rsiResult = parseFloat(rsi.getResult().valueOf()).toFixed(4);
          const onDemand = parseFloat(macdResult.histogram.valueOf()).toFixed(
            4,
          );
          const up = parseFloat(macdResult.macd.valueOf()).toFixed(4);
          const down = parseFloat(macdResult.signal.valueOf()).toFixed(4);
          return {
            timestamp: last,
            rsiResult: Number(rsiResult),
            onDemand: Number(onDemand),
            up: Number(up),
            down: Number(down),
            lastClose: Number(lastClose),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((el) => el);
    console.log('train');
    const net = new neuro.classifiers.NeuralNetwork();
    const bar = [];
    toTrains.forEach((train, i) => {
      const next = toTrains[i + 1];
      const before = toTrains[i - 1];
      const beforeBefore = toTrains[i - 2];
      if (!next || !before || !beforeBefore) {
        return null;
      }
      const rsiMin =
        before.rsiResult > train.rsiResult ? train.rsiResult : before.rsiResult;
      const rsiMax =
        before.rsiResult > train.rsiResult ? before.rsiResult : train.rsiResult;
      const stockRsi = (train.rsiResult - rsiMin) / (rsiMax - rsiMin);

      const beforeRsiMin =
        beforeBefore.rsiResult > before.rsiResult
          ? before.rsiResult
          : beforeBefore.rsiResult;
      const beforeRsiMax =
        beforeBefore.rsiResult > before.rsiResult
          ? beforeBefore.rsiResult
          : before.rsiResult;
      const beforeStockRsi =
        (before.rsiResult - beforeRsiMin) / (beforeRsiMax - beforeRsiMin);

      bar.push({
        input: [
          (train.rsiResult - before.rsiResult) / before.rsiResult,
          (train.onDemand - before.onDemand) / before.onDemand,
          (train.up - before.up) / before.up,
          (train.down - before.down) / before.down,
          (train.lastClose - before.lastClose) / before.lastClose,
          stockRsi,

          (before.rsiResult - beforeBefore.rsiResult) / beforeBefore.rsiResult,
          (before.up - beforeBefore.up) / beforeBefore.up,
          (before.down - beforeBefore.down) / beforeBefore.down,
          (before.lastClose - beforeBefore.lastClose) / beforeBefore.lastClose,
          beforeStockRsi,
        ],
        output: {
          up: next.lastClose > train.lastClose ? 1 : 0,
          down: next.lastClose < train.lastClose ? 1 : 0,
        }, // tomorow result
      });
    });
    net.trainBatch(bar);
    console.log('result');
    const onDays = {
      rsiResult: 64.43,
      onDemand: -0.1701,
      up: 7.5937,
      down: 7.7638,
      lastClose: 40.5969,
      timestamp: Date.now(),
    };
    const before = toTrains[toTrains.length - 1];
    const beforeBefore = toTrains[toTrains.length - 2];
    let value: { up: number; down: number } | undefined;
    if (before && beforeBefore) {
      const rsiMin =
        before.rsiResult > onDays.rsiResult
          ? onDays.rsiResult
          : before.rsiResult;
      const rsiMax =
        before.rsiResult > onDays.rsiResult
          ? before.rsiResult
          : onDays.rsiResult;
      const stockRsi = (onDays.rsiResult - rsiMin) / (rsiMax - rsiMin);

      const beforeRsiMin =
        beforeBefore.rsiResult > before.rsiResult
          ? before.rsiResult
          : beforeBefore.rsiResult;
      const beforeRsiMax =
        beforeBefore.rsiResult > before.rsiResult
          ? beforeBefore.rsiResult
          : before.rsiResult;
      const beforeStockRsi =
        (before.rsiResult - beforeRsiMin) / (beforeRsiMax - beforeRsiMin);

      value = net.classify([
        (onDays.rsiResult - before.rsiResult) / before.rsiResult,
        (onDays.onDemand - before.onDemand) / before.onDemand,
        (onDays.up - before.up) / before.up,
        (onDays.down - before.down) / before.down,
        (onDays.lastClose - before.lastClose) / before.lastClose,
        stockRsi,

        (before.rsiResult - beforeBefore.rsiResult) / beforeBefore.rsiResult,
        (before.up - beforeBefore.up) / beforeBefore.up,
        (before.down - beforeBefore.down) / beforeBefore.down,
        (before.lastClose - beforeBefore.lastClose) / beforeBefore.lastClose,
        beforeStockRsi,
      ]) as { up: number; down: number };
      if (value.up > 0.6) {
        console.log(addDays(onDays.timestamp, 1), 'up', value);
      } else if (value.down > 0.6) {
        console.log(addDays(onDays.timestamp, 1), 'down', value);
      } else {
        console.log(addDays(onDays.timestamp, 1), 'not decided', value);
      }
    }
    return { up: `${value.up || '0'}`, down: `${value.down || '0'}` };
  }
}

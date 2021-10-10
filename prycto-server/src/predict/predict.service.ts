import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cours, CoursDocument } from '../cours/cours.schema';
import { CoursService } from '../cours/cours.service';
import { PositionsService } from '../positions/positions.service';
import { RSI, MACD, EMA } from 'trading-signals';
import { uniqBy } from 'lodash';
import * as fs from 'fs';
import { addDays } from 'date-fns';
import { Predict, PredictDocument } from './predict.schema';
import { Position } from 'src/positions/positions.schema';
import { CcxtService } from 'src/ccxt/ccxt.service';

@Injectable()
export class PredictService {
  constructor(
    @InjectModel(Predict.name)
    private readonly predictModel: Model<PredictDocument>,
    @InjectModel(Cours.name)
    private readonly coursModel: Model<CoursDocument>,
    private readonly coursService: CoursService,
    private readonly ccxtService: CcxtService,
    private readonly positionsService: PositionsService,
  ) {}

  newClassifier() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const limdu = require('limdu');
    return new limdu.classifiers.NeuralNetwork();
  }

  findAll(): Promise<PredictDocument[]> {
    return this.predictModel.find({}).exec();
  }

  // @Timeout(1000)
  async predictByPair(pair: string) {
    return this.predictModel.findOne({ pair }).sort({ createdAt: -1 });
  }

  // @Timeout(1000)
  async handleScript() {
    const positions = await this.positionsService.findAll();
    const uniqPositions = uniqBy(positions, 'pair');
    for (const position of uniqPositions) {
      // await this.generatePredictByPositionId(position._id);
      // await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  calculateIndice(cours: { close: number; timestamp: number }[][]) {
    return cours
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
  }

  async generatePredictByPositionId(idPosition: string) {
    const position = await this.positionsService.findById(idPosition);
    if (!position) {
      throw new NotFoundException();
    }

    const { exchangeId, pair: symbol } = position;
    const foo = await this.ccxtService.getCurrenciesByPair({
      exchangeId: exchangeId,
      symbol,
    });

    const intentClassifierString = fs.readFileSync(
      `./${symbol.replace('/', '')}.txt`,
    );
    const net = this.newClassifier();
    net.fromJSON(JSON.parse(intentClassifierString.toString()));

    await this.coursService.syncCoursHistory(exchangeId, symbol, 110);
    const cours = await this.coursModel
      .find({ exchangeId, symbol })
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();

    const toto: { close: number; timestamp: number }[][] = [];
    [
      ...cours,
      { close: foo.pairs[symbol].close, timestamp: Date.now() },
    ].forEach((cour) => {
      const last = toto[toto.length - 1] || [];
      toto.push([...last, cour]);
    });
    console.log('calculate indice');
    const toTrains = this.calculateIndice(toto);

    const onDays = toTrains[toTrains.length - 1];
    const before = toTrains[toTrains.length - 2];
    let value: { up: number; down: number } | undefined;
    if (before) {
      const onDemand =
        (onDays.onDemand - before.onDemand) / (before.onDemand || 1);
      value = net.classify({
        rsi: onDays.rsiResult / 100,
        rsiBefore: before.rsiResult / 100,
        onDemand: onDemand < 0 ? onDemand * -1 : onDemand,
        onDemandSide: onDemand < 0 ? 0 : 1, // 0 down, 1 up
      }) as { up: number; down: number };
      if (value.up > 0.6) {
        // console.log(addDays(onDays.timestamp, 1), 'up', value);
      } else if (value.down > 0.6) {
        // console.log(addDays(onDays.timestamp, 1), 'down', value);
      } else {
        // console.log(addDays(onDays.timestamp, 1), 'not decided', value);
      }
    }
    const result = {
      up: `${(value && value.up) || '0'}`,
      down: `${(value && value.down) || '0'}`,
    };
    await this.predictModel.insertMany([
      {
        createdAt: Date.now(),
        predictDate: addDays(Date.now(), 1).getTime(),
        pair: symbol,
        ...result,
      },
    ]);
  }

  // @Cron('')
  async train(positionId?: string) {
    const positions: Position[] = [];
    if (positionId) {
      const position = await this.positionsService.findById(positionId);
      if (position) {
        positions.push(position);
      }
    } else {
      positions.push(...(await this.positionsService.findAll()));
    }
    const uniqPositions = uniqBy(positions, 'pair');
    // const uniqPositions = positions.find(({ pair }) => pair === 'AXS/BUSD');
    for (const position of uniqPositions) {
      const { exchangeId, pair: symbol } = position;
      await this.coursService.syncCoursHistory(exchangeId, symbol, 110);
      const cours = await this.coursModel
        .find({ exchangeId, symbol })
        .sort({ timestamp: 1 })
        .exec();
      const foo = await this.ccxtService.getCurrenciesByPair({
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
      const toTrains = this.calculateIndice(toto);
      const net = this.newClassifier();
      const bar = [];
      toTrains.forEach((train, i) => {
        const next = toTrains[i + 1];
        const before = toTrains[i - 1];
        const beforeBefore = toTrains[i - 2];
        if (!next || !before || !beforeBefore) {
          return null;
        }
        const onDemand =
          (train.onDemand - before.onDemand) / (before.onDemand || 1);
        bar.push({
          input: {
            rsi: train.rsiResult / 100,
            rsiBefore: before.rsiResult / 100,
            onDemand: onDemand < 0 ? onDemand * -1 : onDemand,
            onDemandSide: onDemand < 0 ? 0 : 1, // 0 down, 1 up
          },
          output: {
            up: next.lastClose > train.lastClose ? 1 : 0,
            down: next.lastClose < train.lastClose ? 1 : 0,
          }, // tomorow result
        });
      });
      if (bar.length > 0) {
        net.trainBatch(bar);
        fs.writeFileSync(
          `./${symbol.replace('/', '')}.txt`,
          JSON.stringify(net.toJSON()),
        );
      }
    }
  }
}

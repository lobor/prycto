import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { RSI, MACD, EMA } from 'trading-signals';
import { CoursService } from '../cours/cours.service';
import { AppService } from '../app.service';
import { NotFoundException, UseGuards } from '@nestjs/common';
import * as neuro from 'limdu';
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Cours, CoursDocument } from '../cours/cours.schema';
import { Model } from 'mongoose';
import { Predict } from './predict.model';
import { PositionsService } from '../positions/positions.service';
import { uniqBy } from 'lodash';
import { PredictService } from './predict.service';
import { Position } from '../positions/positions.schema';
import { Cron } from '@nestjs/schedule';
import { AuthGuard } from '../user/guards/auth.guard';
import { PredictDocument } from './predict.schema';

@Resolver(() => Predict)
export class PredictResolver {
  constructor(
    @InjectModel(Cours.name)
    private readonly coursModel: Model<CoursDocument>,
    private readonly coursService: CoursService,
    private readonly positionsService: PositionsService,
    private readonly predictService: PredictService,
  ) {}

  @Query(() => [Predict])
  @UseGuards(AuthGuard)
  async predictHistory(): Promise<Predict[]> {
    const predicts = await this.predictService.findAll();
    const predictsByPairs = predicts.reduce<Record<string, PredictDocument[]>>(
      (acc, predict) => {
        if (!acc[predict.pair]) {
          acc[predict.pair] = [];
        }
        acc[predict.pair].push(predict);
        return acc;
      },
      {},
    );
    // console.log(predictsByPairs);
    const toto: Record<string, PredictDocument[]> = {};
    Object.keys(predictsByPairs).forEach((pair) => {
      const predictPair = predictsByPairs[pair];
      toto[pair] = Object.values(
        predictPair.reduce<Record<number, PredictDocument>>((acc, predict) => {
          const predictDate = startOfDay(predict.predictDate).getTime();
          if (
            !acc[predictDate] ||
            isSameDay(predictDate, acc[predictDate].predictDate)
          ) {
            acc[predictDate] = predict;
          }
          return acc;
        }, {}),
      );
    });
    // console.log(toto);
    const foo: (Predict & { verified: boolean })[] = [];
    for (const pair of Object.keys(toto)) {
      const predictPair = predictsByPairs[pair];
      // const cours = await this.coursService.syncCoursHistory(exchangeId, symbol, 110);
      const cours = await this.coursModel
        .find({ symbol: pair })
        .sort({ timestamp: -1 })
        .limit(10)
        .exec();
      for (const predict of predictPair) {
        const coursSameDay = cours.find(({ timestamp }) => {
          return isSameDay(timestamp, predict.predictDate);
        });
        if (!coursSameDay) {
          continue;
        }

        const isUp = coursSameDay.open < coursSameDay.close;
        const isUpPredict = Number(predict.up) > 0.5;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        foo.push({ ...predict._doc, verified: isUp === isUpPredict });
      }
      // const coursSameDay
      // const predictSameDay
    }
    return foo;
  }

  @Query(() => Boolean)
  // @Cron('* 10 3 * * *', { name: 'predict', timeZone: 'Europe/Paris' })
  async predictManually(
    @Args('positionId', { nullable: true }) positionId: string,
  ) {
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
    for (const position of uniqPositions) {
      console.log('start', position.pair);
      await this.predictService.generatePredictByPositionId(position._id);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      console.log('finish', position.pair);
    }
    return true;
  }

  @Query(() => Boolean)
  // @Cron('* 10 2 * * *', { name: 'train', timeZone: 'Europe/Paris' })
  async trainManually(@Args('positionId') positionId: string) {
    await this.predictService.train(positionId);
    return true;
  }
}

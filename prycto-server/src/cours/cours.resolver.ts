import { UseGuards } from '@nestjs/common';
import { Query, Args, Context, Resolver, Int } from '@nestjs/graphql';
import { keyBy } from 'lodash';
import { AppService } from 'src/app.service';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { Cours } from './cours.model';
import { CoursService } from './cours.service';
import { isSameDay, subDays } from 'date-fns';

@Resolver(() => Cours)
export class CoursResolver {
  constructor(
    private readonly coursService: CoursService,
    private readonly appService: AppService,
  ) {}

  @Query(() => [Cours])
  @UseGuards(EchangeIdGuard)
  async getHistoryBySymbol(
    @Context() ctx: { exchangeId: string },
    @Args('symbol') symbol: string,
    @Args('limit', { nullable: true, defaultValue: 7, type: () => Int })
    limit: number,
  ): Promise<Cours[]> {
    const cours = await this.coursService
      .findByExchangeIdAndSymbol(ctx.exchangeId, symbol)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();

    if (
      cours.length === 0 ||
      !isSameDay(new Date(cours[0].timestamp), subDays(new Date(), 1))
    ) {
      const coursByTimestamp = keyBy(cours, 'timestamp');
      const coursNotHave = (
        await this.appService.fetchOHLCV(
          ctx.exchangeId,
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
        exchangeId: ctx.exchangeId,
      }));

      const toSave = coursNotHave.filter(
        ({ timestamp }: any) =>
          !coursByTimestamp[timestamp] &&
          !isSameDay(new Date(timestamp), new Date()),
      );

      if (toSave.length > 0) {
        await this.coursService.insertMany(toSave);
      }

      return this.coursService
        .findByExchangeIdAndSymbol(ctx.exchangeId, symbol)
        .limit(limit)
        .sort({ timestamp: -1 })
        .exec();
    }
    return cours;
  }
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { History } from './history.model';
import { HistoryService } from './history.service';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/user/guards/auth.guard';

@Resolver(() => History)
export class HistoryResolver {
  constructor(
    private readonly historyService: HistoryService,
    private readonly appService: AppService,
  ) {}

  @Query(() => [History])
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async getHistoryOrderBySymbol(
    @Context() ctx: { exchangeId: string },
    @Args('symbol') symbol: string,
  ): Promise<History[]> {
    return this.appService.getHistoryByExchangeId({
      exchangeId: ctx.exchangeId,
      pairs: [symbol],
    }) as unknown as History[];
  }
}

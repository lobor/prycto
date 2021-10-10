import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { History } from './history.model';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { AuthGuard } from '../user/guards/auth.guard';
import { PositionsService } from '../positions/positions.service';
import { User } from '../user/user.schema';
import { CcxtService } from 'src/ccxt/ccxt.service';
import { ExchangeService } from 'src/exchanges/service';

@Resolver(() => History)
export class HistoryResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly positionsService: PositionsService,
    private readonly ccxtService: CcxtService,
  ) {}

  @Query(() => [History])
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async getHistoryOrderBySymbol(
    @Context() ctx: { user: User },
    @Args('symbol') symbol: string,
    @Args('positionId') positionId: string,
  ): Promise<History[]> {
    const position = await this.positionsService.findById(positionId);
    if (!position || position.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }

    const exchange = await this.exchangeService.findById(position.exchangeId);
    if (!exchange || exchange.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }

    if (exchange.exchange === 'bsc') {
      return [];
    }
    return this.ccxtService.getHistoryByExchangeId({
      exchangeId: position.exchangeId,
      pairs: [symbol],
    }) as unknown as History[];
  }
}

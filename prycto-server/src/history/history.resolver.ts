import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { History } from './history.model';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { AuthGuard } from '../user/guards/auth.guard';
import { PositionsService } from '../positions/positions.service';
import { User } from '../user/user.schema';
import { CcxtService } from 'src/ccxt/ccxt.service';
import { ExchangeService } from 'src/exchanges/service';
import { keyBy } from 'lodash';

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
    @Args('positionIds', { type: () => [String] }) positionId: string[],
  ): Promise<History[]> {
    const positions = await this.positionsService.findByPositionIds(positionId);
    if (
      positions.some((position) => position.userId !== ctx.user._id.toString())
    ) {
      throw new NotFoundException();
    }

    const exchangeOfPositions = keyBy(positions, 'exchangeId');

    if (Object.keys(exchangeOfPositions).length !== 1) {
      throw new NotFoundException();
    }

    const exchange = await this.exchangeService.findById(
      Object.keys(exchangeOfPositions)[0],
    );

    if (!exchange || exchange.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }

    return this.ccxtService.getOrderBySymbolByExchangeId({
      exchangeId: exchange._id,
      pairs: positions.map(({ pair }) => pair),
    }) as unknown as History[];
  }

  @Query(() => [History])
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async getHistoryOrderByExchange(
    @Context() ctx: { user: User },
    @Args('exchangeId', { type: () => String }) exchangeId: string,
  ): Promise<History[]> {
    return this.ccxtService.getOrderByExchangeId(
      exchangeId,
    ) as unknown as History[];
  }
}

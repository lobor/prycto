import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { History } from './history.model';
import { HistoryService } from './history.service';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { AppService } from '../app.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { PositionsService } from '../positions/positions.service';

@Resolver(() => History)
export class HistoryResolver {
  constructor(
    private readonly historyService: HistoryService,
    private readonly positionsService: PositionsService,
    private readonly appService: AppService,
  ) {}

  @Query(() => [History])
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async getHistoryOrderBySymbol(
    @Args('symbol') symbol: string,
    @Args('positionId') positionId: string,
  ): Promise<History[]> {
    const position = await this.positionsService.findById(positionId);
    if (!position) {
      throw new NotFoundException();
    }
    return this.appService.getHistoryByExchangeId({
      exchangeId: position.exchangeId,
      pairs: [symbol],
    }) as unknown as History[];
  }
}

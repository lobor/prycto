import { UseGuards } from '@nestjs/common';
import { Query, Args, Context, Resolver, Int } from '@nestjs/graphql';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { Cours } from './cours.model';
import { CoursService } from './cours.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { ExchangeService } from 'src/exchanges/service';

@Resolver(() => Cours)
export class CoursResolver {
  constructor(
    private readonly coursService: CoursService,
    private readonly exchangeService: ExchangeService,
  ) {}

  @Query(() => [Cours])
  @UseGuards(AuthGuard)
  @UseGuards(EchangeIdGuard)
  async getHistoryBySymbol(
    @Context() ctx: { exchangeId: string },
    @Args('symbol') symbol: string,
    @Args('limit', { nullable: true, defaultValue: 7, type: () => Int })
    limit: number,
  ): Promise<Cours[]> {
    const exchange = await this.exchangeService.findById(ctx.exchangeId);
    if (exchange.exchange === 'metamask') {
      return [];
    }
    return this.coursService.syncCoursHistory(ctx.exchangeId, symbol, limit);
  }
}

import { Resolver, Query, Subscription, Args, Context } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { Market } from './markets.model';
import { PositionsService } from '../positions/positions.service';
import { UseGuards } from '@nestjs/common';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { ExchangeService } from '../exchanges/service';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from 'src/user/user.schema';
import { CcxtService } from 'src/ccxt/ccxt.service';

@Resolver(() => JSON)
export class MarketsResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly positionsService: PositionsService,
    private readonly ccxtService: CcxtService,
    private readonly pubSub: PubSubService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => JSON)
  async getMarkets(
    @Context() ctx: { user: User },
    @Args('exchangeId') exchangeId: string,
  ): Promise<Market> {
    const positions = await this.positionsService.findByExchangeId(exchangeId, {
      userId: ctx.user._id.toString(),
    });
    const [currencies] = await this.ccxtService.getCurrencies({
      [exchangeId]: positions.map(({ pair }) => pair),
    });
    if (currencies) {
      return currencies.pairs.reduce((acc: any, currency: any) => {
        acc[currency.symbol] = currency.last;
        return acc;
      }, {});
    } else {
      return {};
    }
  }

  @Subscription(() => JSON, {
    async filter(this: MarketsResolver, payload: any, variables: any, context) {
      const [exchangeFound] = await this.exchangeService.find({
        _id: variables.exchangeId,
        exchange: payload.exchange,
      });
      return Boolean(exchangeFound);
    },
    resolve(payload) {
      return (payload && payload.pair) || {};
    },
  })
  marketHit(@Args('exchangeId') exchangeId: string) {
    return this.pubSub.asyncIterator('marketHit');
  }
}

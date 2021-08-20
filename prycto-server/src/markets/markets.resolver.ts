import { Resolver, Query, Subscription, Args } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { Market } from './markets.model';
import { PositionsService } from '../positions/positions.service';
import { AppService } from '../app.service';
import { UseGuards } from '@nestjs/common';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { ExchangeService } from '../exchanges/service';
import { AuthGuard } from '../user/guards/auth.guard';

@Resolver(() => JSON)
export class MarketsResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly positionsService: PositionsService,
    private readonly appService: AppService,
    private readonly pubSub: PubSubService,
    private readonly socketExchange: SocketExchangeService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => JSON)
  async getMarkets(@Args('exchangeId') exchangeId: string): Promise<Market> {
    const positions = await this.positionsService.findByExchangeId(exchangeId);
    const [currencies] = await this.appService.getCurrencies({
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

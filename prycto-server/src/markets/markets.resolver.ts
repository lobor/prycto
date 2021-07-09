import { Resolver, Query, Context, Subscription } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { Market } from './markets.model';
import { PositionsService } from 'src/positions/positions.service';
import { AppService } from 'src/app.service';
import { UseGuards } from '@nestjs/common';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Resolver(() => JSON)
export class MarketsResolver {
  constructor(
    private readonly positionsService: PositionsService,
    private readonly appService: AppService,
    private readonly pubSub: PubSubService,
  ) {}

  @UseGuards(EchangeIdGuard)
  @Query(() => JSON)
  async getMarkets(@Context() ctx: { exchangeId: string }): Promise<Market> {
    const positions = await this.positionsService.findByExchangeId(
      ctx.exchangeId,
    );
    const [currencies] = await this.appService.getCurrencies({
      [ctx.exchangeId]: positions.map(({ pair }) => pair),
    });
    return currencies.pairs.reduce((acc: any, currency: any) => {
      acc[currency.symbol] = currency.last;
      return acc;
    }, {});
  }

  @Subscription(() => JSON, {
    resolve(payload) {
      return payload || {};
    },
  })
  marketHit() {
    return this.pubSub.asyncIterator('marketHit');
  }
}

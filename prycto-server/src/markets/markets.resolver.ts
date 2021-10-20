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
import { TokenPrice } from '../utils/tokenPrice';
import * as Web3 from 'web3';
import { keyBy } from 'lodash';

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
    const exchange = await this.exchangeService.findById(exchangeId);

    const positions = await this.positionsService.findByExchangeId(exchangeId, {
      userId: ctx.user._id.toString(),
    });
    if (exchange.exchange === 'metamask') {
      const web3 = new (Web3 as any)('https://bsc-dataseed1.binance.org');
      const minABI = [
        // balanceOf
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function',
        },
        // decimals
        {
          constant: true,
          inputs: [],
          name: 'decimals',
          outputs: [{ name: '', type: 'uint8' }],
          type: 'function',
        },
      ];
      const positionsArray = await Promise.all(
        positions.map(async (position) => {
          const price = await TokenPrice.calcSell(web3, position.address);
          return {
            symbol: position.pair,
            price,
          };
        }),
      );
      return positionsArray.reduce((acc, { symbol, price }) => {
        acc[symbol] = price;
        return acc;
      }, {});
    } else {
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

import { Resolver, Query, Context } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { Market } from './markets.model';
import { PositionsService } from 'src/positions/positions.service';
import { AppService } from 'src/app.service';
import { UseGuards } from '@nestjs/common';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { ExchangeService } from 'src/exchanges/service';

@Resolver(() => JSON)
export class MarketsResolver {
  constructor(
    private readonly positionsService: PositionsService,
    private readonly appService: AppService,
    private readonly exchangeService: ExchangeService,
  ) {}

  @UseGuards(EchangeIdGuard)
  @Query(() => JSON)
  async getMarkets(@Context() ctx: { exchangeId: string }): Promise<Market> {
    const exchange = (
      await this.exchangeService.findById(ctx.exchangeId)
    ).toJSON();
    const positions = await this.positionsService.findByExchangeId(
      ctx.exchangeId,
    );
    this.appService.addExchange({
      ...exchange,
      secretKey: this.appService.decrypt(exchange.secretKey),
      publicKey: this.appService.decrypt(exchange.publicKey),
    });
    const [currencies] = await this.appService.getCurrencies({
      [ctx.exchangeId]: positions.map(({ pair }) => pair),
    });
    return currencies.pairs.reduce((acc: any, currency: any) => {
      acc[currency.symbol] = currency.last;
      return acc;
    }, {});
  }
}

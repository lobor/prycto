import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../user/guards/auth.guard';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { Pair } from './pairs.model';
import { CcxtService } from 'src/ccxt/ccxt.service';

@Resolver()
export class PairsResolver {
  constructor(private readonly ccxtService: CcxtService) {}

  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  @Query(() => [Pair])
  async getPairs(@Context() ctx: { exchangeId: string }): Promise<Pair[]> {
    try {
      return this.ccxtService.getMarketByExchangeId(ctx.exchangeId);
    } catch (e) {
      return [];
    }
  }
}

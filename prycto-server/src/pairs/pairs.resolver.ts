import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { Pair } from './pairs.model';

@Resolver()
export class PairsResolver {
  constructor(private readonly appService: AppService) {}

  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  @Query(() => [Pair])
  async getPairs(@Context() ctx: { exchangeId: string }): Promise<Pair[]> {
    return this.appService.getMarketByExchangeId(ctx.exchangeId);
  }
}

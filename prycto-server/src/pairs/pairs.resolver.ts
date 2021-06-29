import { Context, Query, Resolver } from '@nestjs/graphql';
import { AppService } from 'src/app.service';
import { Pair } from './pairs.model';

@Resolver()
export class PairsResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [Pair])
  async getPairs(@Context() ctx: { exchangeId: string }): Promise<Pair[]> {
    return this.appService.getMarketByExchangeId(ctx.exchangeId);
  }
}

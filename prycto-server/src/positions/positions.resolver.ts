import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Context } from '@nestjs/graphql';
import { Position } from './positions.model';
import { PositionsService } from './positions.service';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { ExchangeService } from 'src/exchanges/service';
import { flatten } from 'lodash';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(
    private readonly positionService: PositionsService,
    private readonly exchangeService: ExchangeService,
  ) {}

  @Query(() => [Position])
  @UseGuards(EchangeIdGuard)
  async positions(@Context() ctx: { exchangeId: string }): Promise<Position[]> {
    const exchange = await this.exchangeService.findById(ctx.exchangeId);
    if (!exchange) {
      new NotFoundException();
    }
    const positions = await this.positionService.findByExchangeId(
      ctx.exchangeId,
    );
    return positions.map((position) => {
      const { pair } = position;
      const [asset1] = pair.split('/');
      return {
        ...position.toJSON(),
        ...exchange.balance[asset1],
        exchange: exchange.exchange,
      };
    });
  }
}

import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { Position } from './positions.model';
import { PositionsService } from './positions.service';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { ExchangeService } from 'src/exchanges/service';
import { AppService } from 'src/app.service';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(
    private readonly positionService: PositionsService,
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
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
        ...((exchange.balance && exchange.balance[asset1]) || {}),
        exchange: exchange.exchange,
      };
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(EchangeIdGuard)
  async removePosition(
    @Context() ctx: { exchangeId: string },
    @Args('_id') _id: string,
  ): Promise<boolean> {
    await this.positionService.deleteOne(_id);
    return true;
  }

  @Mutation(() => Position)
  @UseGuards(EchangeIdGuard)
  async addPosition(
    @Context() ctx: { exchangeId: string },
    @Args('symbol') symbol: string,
  ): Promise<Position> {
    const pair = await this.positionService.findByPair(ctx.exchangeId, symbol);
    if (pair) {
      throw new Error('pair already exist');
    }
    const histories = await this.appService.getHistoryByExchangeId({
      exchangeId: ctx.exchangeId,
      pairs: [symbol],
    });
    const historiesOnPosition = histories.filter(
      (history) => history.symbol === symbol,
    );
    const positionTmp = {
      exchangeId: ctx.exchangeId,
      pair: symbol,
      investment: 0,
      available: 0,
      objectif: 0,
    };
    let investment = 0;
    historiesOnPosition.forEach((order) => {
      if (order.status === 'closed') {
        if (order.side === 'buy') {
          investment += Number(order.cost);
        }
        if (order.side === 'sell') {
          investment -= Number(order.cost);
        }
      }
    });
    positionTmp.investment = investment < 0 ? 0 : investment;
    const position = await this.positionService.insertOne(positionTmp);
    return position;
  }
}

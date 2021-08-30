import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Context,
  Mutation,
  Args,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { Position } from './positions.model';
import { PositionsService } from './positions.service';
import { EchangeIdGuard } from '../exchanges/guards/exchangeId.guard';
import { ExchangeService } from '../exchanges/service';
import { AppService } from '../app.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { User, UserDocument } from '../user/user.schema';
import { PredictService } from '../predict/predict.service';
import { Predict } from '../predict/predict.model';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(
    private readonly socketExchange: SocketExchangeService,
    private readonly positionService: PositionsService,
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
    private readonly predictService: PredictService,
  ) {}

  @Query(() => [Position])
  @UseGuards(AuthGuard)
  async positions(
    @Context() ctx: { user: User },
    @Args('exchangeId', { type: () => ID }) exchangeId: string,
  ): Promise<Position[]> {
    const exchange = await this.exchangeService.findById(exchangeId);
    if (!exchange || ctx.user._id.toString() !== exchange.userId) {
      throw new NotFoundException();
    }
    const positions = await this.positionService.findByExchangeId(exchangeId);
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

  @ResolveField()
  async predict(@Parent() position: Position) {
    const { pair } = position;
    const predict = await this.predictService.predictByPair(pair);
    return predict || { up: 0.5, down: 0.5, predictDate: Date.now() };
  }

  @ResolveField()
  async balance(@Parent() position: Position) {
    const { exchangeId, pair } = position;
    const exchange = (await this.exchangeService.findById(exchangeId)).toJSON();
    if (!exchange) {
      throw new NotFoundException();
    }
    return pair.split('/').reduce((acc, symbol) => {
      acc[symbol] =
        exchange.balance && exchange.balance[symbol]
          ? exchange.balance[symbol].available + exchange.balance[symbol].locked
          : 0;
      return acc;
    }, {});
  }

  @Query(() => Position)
  @UseGuards(AuthGuard)
  async position(
    @Context() ctx: { user: User },
    @Args('_id') _id: string,
  ): Promise<Position> {
    const position = await this.positionService.findById(_id);
    if (!position || ctx.user._id.toString() !== position.userId) {
      throw new NotFoundException();
    }
    const exchange = await this.exchangeService.findById(position.exchangeId);
    if (!exchange) {
      throw new NotFoundException();
    }
    const [asset1] = position.pair.split('/');
    return {
      ...position,
      ...((exchange.balance && asset1 && exchange.balance[asset1]) || {}),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async removePosition(
    @Context() ctx: { exchangeId: string; user: UserDocument },
    @Args('_id') _id: string,
  ): Promise<boolean> {
    const position = await this.positionService.findById(_id);
    if (!position || ctx.user._id.toString() !== position.userId) {
      throw new NotFoundException();
    }
    await this.positionService.deleteOne(_id);
    return true;
  }

  @Mutation(() => Position)
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async editPosition(
    @Context() ctx: { user: UserDocument },
    @Args('_id') _id: string,
    @Args('objectif') objectif: number,
  ): Promise<Position> {
    const position = await this.positionService.findById(_id);
    if (!position || ctx.user._id.toString() !== position.userId) {
      throw new Error('position not found');
    }
    return this.positionService.updateOne(_id, { objectif: Number(objectif) });
  }

  @Mutation(() => Position)
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async syncPositions(
    @Context() ctx: { exchangeId: string; user: UserDocument },
    @Args('_id') _id: string,
  ): Promise<Position> {
    const exchange = await this.exchangeService.findById(ctx.exchangeId);
    if (!exchange || ctx.user._id.toString() !== exchange.userId) {
      throw new Error('exchange not found');
    }
    const position = await this.positionService.findById(_id);
    if (!position || ctx.user._id.toString() !== position.userId) {
      throw new Error('position not found');
    }
    const balance = await this.appService.getBalancesByExchangeId(
      ctx.exchangeId,
    );

    const histories = await this.appService.getHistoryByExchangeId({
      exchangeId: ctx.exchangeId,
      pairs: [position.pair],
    });
    const historiesOnPosition = histories.filter(
      (history) => history.symbol === position.pair,
    );
    let investment = 0;
    let amount = 0;
    historiesOnPosition.forEach((order) => {
      if (order.status === 'closed') {
        if (order.side === 'buy') {
          amount += Number(order.amount);
          investment += Number(order.cost);
        }
        if (order.side === 'sell') {
          let percentSell = 0;
          if (amount < order.amount) {
            percentSell = (100 * amount) / order.amount;
          } else {
            percentSell = (100 * order.amount) / amount;
          }
          amount -= Number(order.amount);
          investment -= (investment * percentSell) / 100;
        }
      }
    });
    // investment = investment < 0 ? 0 : investment;
    await this.positionService.updateOne(position._id, {
      investment,
    });

    Object.keys(balance).forEach((position) => {
      if (exchange.balance[position]) {
        exchange.balance[position].available = balance[position].available;
        if (
          balance[`LD${position}`] &&
          balance[`LD${position}`].available >= 0
        ) {
          exchange.balance[position].locked =
            balance[`LD${position}`].available;
        }
      } else {
        exchange.balance[position] = balance[position];
        if (
          balance[`LD${position}`] &&
          balance[`LD${position}`].available >= 0
        ) {
          exchange.balance[position].locked =
            balance[`LD${position}`].available;
        }
      }
    });
    await this.exchangeService.updateOneById(ctx.exchangeId, {
      balance: exchange.balance,
    });

    return position;
  }

  @Mutation(() => Position)
  @UseGuards(EchangeIdGuard)
  @UseGuards(AuthGuard)
  async addPosition(
    @Context() ctx: { exchangeId: string; user: User },
    @Args('symbol') symbol: string,
  ): Promise<Position> {
    const exchange = await this.exchangeService.findById(ctx.exchangeId);
    if (!exchange) {
      throw new Error('exchange not found');
    }
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
      userId: ctx.user._id,
    };
    let investment = 0;
    let amount = 0;
    historiesOnPosition.forEach((order) => {
      if (order.status === 'closed') {
        if (order.side === 'buy') {
          amount += Number(order.amount);
          investment += Number(order.cost);
        }
        if (order.side === 'sell') {
          let percentSell = 0;
          if (amount < order.amount) {
            percentSell = (100 * amount) / order.amount;
          } else {
            percentSell = (100 * order.amount) / amount;
          }
          amount -= Number(order.amount);
          investment -= (investment * percentSell) / 100;
        }
      }
    });
    await this.socketExchange.subscribeByExchange(
      exchange.exchange as 'ftx' | 'binance',
      [symbol],
    );
    positionTmp.investment = investment < 0 ? 0 : investment;
    const position = await this.positionService.insertOne(positionTmp);
    return position;
  }
}

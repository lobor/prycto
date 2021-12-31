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
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { User, UserDocument } from '../user/user.schema';
import { PredictService } from '../predict/predict.service';
import { CcxtService } from 'src/ccxt/ccxt.service';
import { BscService } from 'src/bsc/bsc.service';
import * as Web3 from 'web3';
import { pancakeSwapAbi } from 'src/utils/tokenPrice';
import { keyBy } from 'lodash';
import { HistoryService } from 'src/history/history.service';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(
    private readonly socketExchange: SocketExchangeService,
    private readonly positionService: PositionsService,
    private readonly exchangeService: ExchangeService,
    private readonly ccxtService: CcxtService,
    private readonly predictService: PredictService,
    private readonly bscService: BscService,
    private readonly historyService: HistoryService,
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
    for (const position of positions) {
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
        ];
        return Promise.all(
          positions.map(async (position) => {
            let balance = 0;
            if (position.address) {
              const contract = new web3.eth.Contract(
                minABI as any,
                position.address,
              );
              balance =
                Number(
                  await contract.methods.balanceOf(exchange.address).call(),
                ) / Number(web3.utils.toWei('1'));
            }
            return {
              ...position.toJSON(),
              available: balance,
              locked: 0,
              exchange: exchange.exchange,
            };
          }),
        );
      } else {
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
    }
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
      ];
      let balance = 0;
      if (position.address) {
        const contract = new web3.eth.Contract(minABI as any, position.address);
        balance =
          Number(await contract.methods.balanceOf(exchange.address).call()) /
          Number(web3.utils.toWei('1'));
      }
      const [base, quote] = pair.split('/');
      return {
        [base]: (position.locked || 0) + (balance || 0),
        [quote]: 0,
      };
    } else {
      return pair.split('/').reduce((acc, symbol) => {
        acc[symbol] =
          exchange.balance && exchange.balance[symbol]
            ? exchange.balance[symbol].available +
              exchange.balance[symbol].locked
            : 0;
        return acc;
      }, {});
    }
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
      ];
      let balance = 0;
      if (position.address) {
        const contract = new web3.eth.Contract(minABI as any, position.address);
        balance =
          Number(await contract.methods.balanceOf(exchange.address).call()) /
          Number(web3.utils.toWei('1'));
      }
      return {
        ...position,
        available: balance,
        exchange: exchange.exchange,
      };
    } else {
      const [asset1] = position.pair.split('/');
      return {
        ...position,
        ...((exchange.balance && asset1 && exchange.balance[asset1]) || {}),
        exchange: exchange.exchange,
      };
    }
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
    @Args('investment') investment: number,
  ): Promise<Position> {
    const position = await this.positionService.findById(_id);
    if (!position || ctx.user._id.toString() !== position.userId) {
      throw new Error('position not found');
    }
    const exchange = await this.exchangeService.findById(position.exchangeId);
    const newPosition = await this.positionService.updateOne(_id, {
      objectif: Number(objectif),
      investment: Number(investment),
    });
    return { ...newPosition, exchange: exchange.exchange };
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

    if (exchange.exchange !== 'bsc') {
      const balance = await this.ccxtService.getBalancesByExchangeId(
        ctx.exchangeId,
      );

      await this.historyService.syncBySymbolAndExchange(
        ctx.exchangeId,
        position.pair,
      );

      const histories = await this.historyService.getBySymbolAndExchange(
        ctx.exchangeId,
        position.pair,
      );
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
            investment -= Number(order.cost);
            // investment -= (investment * percentSell) / 100;
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
    } else {
      const balance = await this.bscService.getBalance(
        exchange._id,
        exchange.address,
      );
      await this.exchangeService.updateOneById(ctx.exchangeId, {
        balance: {
          ...exchange.balance,
          [balance.symbol]: {
            available: balance.available,
            locked: exchange.balance[balance.symbol]
              ? exchange.balance[balance.symbol].locked
              : 0,
          },
        },
      });
    }

    return { ...position, exchange: exchange.exchange };
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

    if (exchange.exchange !== 'metamask') {
      const pair = await this.positionService.findByPair(
        ctx.exchangeId,
        symbol,
      );
      if (pair) {
        throw new Error('pair already exist');
      }
      const histories = await this.ccxtService.getOrderBySymbolByExchangeId({
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
            investment -= Number(order.cost);
            // investment -= (investment * percentSell) / 100;
          }
        }
      });
      await this.socketExchange.subscribeByExchange(
        exchange.exchange as 'ftx' | 'binance',
        [symbol],
      );
      positionTmp.investment = investment < 0 ? 0 : investment;
      const position = await this.positionService.insertOne(positionTmp);
      return { ...position, exchange: exchange.exchange };
    } else {
      const web3 = new (Web3 as any)('https://bsc-dataseed1.binance.org');
      const contract = new web3.eth.Contract(
        [
          // decimals
          {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [{ name: '', type: 'uint8' }],
            type: 'function',
          },
          {
            inputs: [],
            name: 'symbol',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        symbol,
      );
      const positionTmp = {
        exchangeId: ctx.exchangeId,
        pair: `${await contract.methods.symbol().call()}/USDT`,
        investment: 0,
        available: 0,
        objectif: 0,
        userId: ctx.user._id,
        address: symbol,
      };

      const position = await this.positionService.insertOne(positionTmp);

      return { ...position, exchange: exchange.exchange };
    }
  }
}

import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Balance, Exchange } from './model';
import { ExchangeService } from './service';
import { AppService } from '../app.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '../user/user.schema';
import JSON from 'graphql-type-json';
import { CcxtService } from 'src/ccxt/ccxt.service';
import { BscService } from 'src/bsc/bsc.service';

@Resolver(() => Exchange)
export class EchangeResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
    private readonly ccxtService: CcxtService,
    private readonly bscService: BscService,
  ) {}

  @Query(() => Exchange)
  @UseGuards(AuthGuard)
  async exchangeById(
    @Args('_id') _id: string,
    @Context() ctx: { user: User },
  ): Promise<Exchange> {
    const exchange = await this.exchangeService.findById(_id);
    if (!exchange || exchange.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }
    // await this.bscService.getBalance(_id);
    return exchange;
  }

  @Query(() => [Exchange])
  @UseGuards(AuthGuard)
  async exchanges(@Context() ctx: { user: User }): Promise<Exchange[]> {
    return this.exchangeService.findByUserId(ctx.user._id);
  }

  @Mutation(() => Exchange)
  @UseGuards(AuthGuard)
  async addExchange(
    @Context() ctx: { user: User },
    @Args('secretKey') secretKey: string,
    @Args('publicKey') publicKey: string,
    @Args('exchange') exchange: string,
    @Args('address') address: string,
    @Args('name') name: string,
  ): Promise<Exchange> {
    const exchangeSaved = await this.exchangeService.insertOne({
      exchange,
      name,
      address,
      secretKey: this.appService.encrypt(secretKey),
      publicKey: this.appService.encrypt(publicKey),
      userId: ctx.user._id,
    });
    if (publicKey) {
      this.ccxtService.addExchange({
        ...exchangeSaved,
        secretKey: secretKey,
        publicKey: publicKey,
      });
      const balance = await this.ccxtService.getBalancesByExchangeId(
        exchangeSaved._id,
      );
      await this.exchangeService.updateOneById(exchangeSaved._id, { balance });
    } else {
      // U2FsdGVkX19IC3PSs4E0jGPeCPgAFySTQbWocNgxCOGmoLq6sMgB54fR29rVmjAlp8ATwb0ZRnNKL7sUHyqvyw==
      // await this.bscService.getBalance(exchangeSaved._id);
    }
    return exchangeSaved;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeExchange(
    @Context() ctx: { user: User },
    @Args('_id') _id: string,
  ): Promise<boolean> {
    const exchange = await this.exchangeService.findById(_id);
    if (!exchange || exchange.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }
    await this.exchangeService.removeOne(_id);
    return true;
  }

  @Mutation(() => Exchange)
  @UseGuards(AuthGuard)
  async updateExchange(
    @Context() ctx: { user: User },
    @Args('_id', { type: () => ID }) _id: string,
    @Args('balance', { type: () => JSON }) balance: Balance,
  ): Promise<Exchange> {
    const exchange = await this.exchangeService.findById(_id);
    if (!exchange || exchange.userId !== ctx.user._id.toString()) {
      throw new NotFoundException();
    }

    return this.exchangeService.updateOneById(_id, {
      balance: {
        ...exchange.balance,
        ...Object.keys(balance).reduce((acc, key) => {
          if (!acc[key]) {
            acc[key] = exchange.balance[key] || { available: 0, locked: 0 };
          }
          if (Number(balance[key])) {
            acc[key].locked = Number(balance[key]);
          }

          return acc;
        }, {}),
      },
    });
  }
}

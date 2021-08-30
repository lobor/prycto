import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Balance, Exchange } from './model';
import { ExchangeService } from './service';
import { AppService } from '../app.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '../user/user.schema';
import JSON from 'graphql-type-json';

@Resolver(() => Exchange)
export class EchangeResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
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
    @Args('name') name: string,
  ): Promise<Exchange> {
    const exchangeSaved = await this.exchangeService.insertOne({
      exchange,
      name,
      secretKey: this.appService.encrypt(secretKey),
      publicKey: this.appService.encrypt(publicKey),
      userId: ctx.user._id,
    });
    this.appService.addExchange({
      ...exchangeSaved,
      secretKey: secretKey,
      publicKey: publicKey,
    });
    const balance = await this.appService.getBalancesByExchangeId(
      exchangeSaved._id,
    );
    await this.exchangeService.updateOneById(exchangeSaved._id, { balance });
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
      balance: { ...exchange.balance, ...balance },
    });
  }
}

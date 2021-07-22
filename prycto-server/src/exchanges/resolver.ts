import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Exchange } from './model';
import { ExchangeService } from './service';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.schema';

@Resolver(() => Exchange)
export class EchangeResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
  ) {}

  @Query(() => Exchange)
  @UseGuards(AuthGuard)
  async exchangeById(@Args('_id') _id: string): Promise<Exchange> {
    return this.exchangeService.findById(_id);
  }

  @Query(() => [Exchange])
  @UseGuards(AuthGuard)
  async exchanges(): Promise<Exchange[]> {
    return this.exchangeService.findAll();
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
  async removeExchange(@Args('_id') _id: string): Promise<boolean> {
    await this.exchangeService.removeOne(_id);
    return true;
  }
}

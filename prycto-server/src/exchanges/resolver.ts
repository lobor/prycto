import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Exchange } from './model';
import { ExchangeService } from './service';
import { AppService } from 'src/app.service';

@Resolver(() => Exchange)
export class EchangeResolver {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly appService: AppService,
  ) {}

  @Query(() => Exchange)
  async exchangeById(@Args('_id') _id: string): Promise<Exchange> {
    return this.exchangeService.findById(_id);
  }

  @Query(() => [Exchange])
  async exchanges(): Promise<Exchange[]> {
    return this.exchangeService.findAll();
  }

  @Mutation(() => Exchange)
  async addExchange(
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
    });
    this.appService.addExchange({
      ...exchangeSaved,
      secretKey: this.appService.decrypt(secretKey),
      publicKey: this.appService.decrypt(publicKey),
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

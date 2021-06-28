import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Exchange } from './model';
import { ExchangeService } from './service';
import { EchangeIdGuard } from './guards/exchangeId.guard';

@Resolver(() => Exchange)
export class EchangeResolver {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Query(() => Exchange)
  async exchangeById(@Args('_id') _id: string): Promise<Exchange> {
    return this.exchangeService.findById(_id);
  }

  @Query(() => [Exchange])
  async exchanges(): Promise<Exchange[]> {
    return this.exchangeService.findAll();
  }

  @UseGuards(EchangeIdGuard)
  @Query(() => Boolean)
  async checkHeader(): Promise<boolean> {
    return false;
  }
}

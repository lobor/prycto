import { Resolver, Query } from '@nestjs/graphql';
import { ExchangeService } from '../exchanges/service';

@Resolver()
export class InitResolver {
  constructor(private readonly exchangeService: ExchangeService) {}

  // @Query(() => Boolean)
  // async hasInit1(): Promise<boolean> {
  //   const exchanges = await this.exchangeService.findAll();
  //   return exchanges.length > 0;
  // }
}

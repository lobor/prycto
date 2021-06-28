import { Module } from '@nestjs/common';
import { InitResolver } from './init.resolver';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from '../exchanges/exchange.schema';

@Module({
  imports: [ExchangeImport],
  providers: [InitResolver, ExchangeService],
})
export class InitModule {}

import { Module } from '@nestjs/common';
import { EchangeResolver } from './resolver';
import { ExchangeService } from './service';
import { ExchangeImport } from './exchange.schema';

@Module({
  imports: [ExchangeImport],
  providers: [EchangeResolver, ExchangeService],
})
export class ExchangeModule {}

import { Module } from '@nestjs/common';
import { CcxtService } from './ccxt.service';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';

@Module({
  imports: [ExchangeImport],
  providers: [CcxtService, ExchangeService],
  exports: [CcxtService],
})
export class CcxtServiceModule {}

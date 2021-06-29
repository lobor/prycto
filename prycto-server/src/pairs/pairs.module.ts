import { Module } from '@nestjs/common';
import { PairsResolver } from './pairs.resolver';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';

@Module({
  imports: [ExchangeImport],
  providers: [PairsResolver, AppService, ExchangeService],
})
export class PairsModule {}

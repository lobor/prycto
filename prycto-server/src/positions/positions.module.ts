import { Module } from '@nestjs/common';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { ExchangeService } from 'src/exchanges/service';
import { PositionsResolver } from './positions.resolver';
import { PositionImport } from './positions.schema';
import { PositionsService } from './positions.service';

@Module({
  imports: [PositionImport, ExchangeImport],
  providers: [PositionsService, ExchangeService, PositionsResolver],
})
export class PositionsModule {}

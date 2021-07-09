import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { PositionImport } from 'src/positions/positions.schema';
import { PositionsService } from 'src/positions/positions.service';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Module({
  imports: [PositionImport, ExchangeImport],
  providers: [
    AppService,
    ExchangeService,
    PositionsService,
    MarketsService,
    MarketsResolver,
    PubSubService,
  ],
})
export class MarketsModule {}

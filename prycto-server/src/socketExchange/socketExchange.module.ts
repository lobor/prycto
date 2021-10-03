import { Module } from '@nestjs/common';
import { AppService } from '../app.service';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { SocketExchangeService } from './socketExchange.service';
import { ExchangeModule } from 'src/exchanges/module';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { PositionsService } from 'src/positions/positions.service';
import { PositionImport } from 'src/positions/positions.schema';

@Module({
  imports: [ExchangeModule, CcxtServiceModule, PositionImport],
  providers: [
    AppService,
    SocketExchangeService,
    PositionsService,
    PubSubService,
  ],
  exports: [SocketExchangeService],
})
export class SocketExchangeModule {}

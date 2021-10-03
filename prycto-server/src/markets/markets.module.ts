import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { AppService } from '../app.service';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { ExchangeModule } from 'src/exchanges/module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { PositionsModule } from 'src/positions/positions.module';
import { UserModule } from 'src/user/user.module';
import { SocketExchangeModule } from 'src/socketExchange/socketExchange.module';

@Module({
  imports: [
    PositionsModule,
    UserModule,
    ExchangeModule,
    CcxtServiceModule,
    SocketExchangeModule,
  ],
  providers: [AppService, MarketsService, MarketsResolver, PubSubService],
  exports: [MarketsService],
})
export class MarketsModule {}

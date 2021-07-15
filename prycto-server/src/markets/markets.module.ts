import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { PositionImport } from 'src/positions/positions.schema';
import { PositionsService } from 'src/positions/positions.service';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { SocketExchangeService } from 'src/socketExchange/socketExchange.service';
import { UserService } from 'src/user/user.service';
import { UserImport } from 'src/user/user.schema';

@Module({
  imports: [PositionImport, ExchangeImport, UserImport],
  providers: [
    AppService,
    ExchangeService,
    PositionsService,
    MarketsService,
    MarketsResolver,
    PubSubService,
    SocketExchangeService,
    UserService,
  ],
})
export class MarketsModule {}

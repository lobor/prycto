import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { PositionImport } from '../positions/positions.schema';
import { PositionsService } from '../positions/positions.service';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';

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

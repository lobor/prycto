import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { ExchangeService } from 'src/exchanges/service';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { SocketExchangeService } from 'src/socketExchange/socketExchange.service';
import { UserImport } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { PositionsResolver } from './positions.resolver';
import { PositionImport } from './positions.schema';
import { PositionsService } from './positions.service';

@Module({
  imports: [PositionImport, ExchangeImport, UserImport],
  providers: [
    PositionsService,
    ExchangeService,
    PositionsResolver,
    AppService,
    SocketExchangeService,
    PubSubService,
    UserService,
  ],
})
export class PositionsModule {}

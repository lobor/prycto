import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryImport } from './history.schema';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';
import { PositionImport } from '../positions/positions.schema';
import { PositionsService } from '../positions/positions.service';

@Module({
  imports: [HistoryImport, ExchangeImport, UserImport, PositionImport],
  providers: [
    HistoryService,
    HistoryResolver,
    AppService,
    ExchangeService,
    UserService,
    PositionsService,
  ],
})
export class HistoryModule {}

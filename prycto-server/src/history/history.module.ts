import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryImport } from './history.schema';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { UserService } from 'src/user/user.service';
import { UserImport } from 'src/user/user.schema';
import { PositionImport } from 'src/positions/positions.schema';
import { PositionsService } from 'src/positions/positions.service';

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

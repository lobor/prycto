import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryImport } from './history.schema';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { UserService } from 'src/user/user.service';
import { UserImport } from 'src/user/user.schema';

@Module({
  imports: [HistoryImport, ExchangeImport, UserImport],
  providers: [
    HistoryService,
    HistoryResolver,
    AppService,
    ExchangeService,
    UserService,
  ],
})
export class HistoryModule {}

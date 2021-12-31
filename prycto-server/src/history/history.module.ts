import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryImport } from './history.schema';
import { ExchangeModule } from 'src/exchanges/module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { PositionsModule } from 'src/positions/positions.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    HistoryImport,
    PositionsModule,
    ExchangeModule,
    CcxtServiceModule,
  ],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService],
})
export class HistoryModule {}

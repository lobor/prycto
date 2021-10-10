import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { ExchangeService } from 'src/exchanges/service';
import { UserModule } from '../user/user.module';
import { BscService } from './bsc.service';

@Module({
  imports: [UserModule, ExchangeImport],
  providers: [BscService, AppService, ExchangeService],
  exports: [BscService],
})
export class BscModule {}

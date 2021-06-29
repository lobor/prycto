import { Module } from '@nestjs/common';
import { EchangeResolver } from './resolver';
import { ExchangeService } from './service';
import { ExchangeImport } from './exchange.schema';
import { AppService } from 'src/app.service';

@Module({
  imports: [ExchangeImport],
  providers: [EchangeResolver, ExchangeService, AppService],
})
export class ExchangeModule {}

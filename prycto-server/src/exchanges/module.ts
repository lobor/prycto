import { Module } from '@nestjs/common';
import { EchangeResolver } from './resolver';
import { ExchangeService } from './service';
import { ExchangeImport } from './exchange.schema';
import { AppService } from '../app.service';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';

@Module({
  imports: [ExchangeImport, UserImport],
  providers: [EchangeResolver, ExchangeService, AppService, UserService],
})
export class ExchangeModule {}

import { Module } from '@nestjs/common';
import { EchangeResolver } from './resolver';
import { ExchangeService } from './service';
import { ExchangeImport } from './exchange.schema';
import { AppService } from 'src/app.service';
import { UserService } from 'src/user/user.service';
import { UserImport } from 'src/user/user.schema';

@Module({
  imports: [ExchangeImport, UserImport],
  providers: [EchangeResolver, ExchangeService, AppService, UserService],
})
export class ExchangeModule {}

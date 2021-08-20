import { Module } from '@nestjs/common';
import { PairsResolver } from './pairs.resolver';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { UserImport } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Module({
  imports: [ExchangeImport, UserImport],
  providers: [PairsResolver, AppService, ExchangeService, UserService],
})
export class PairsModule {}

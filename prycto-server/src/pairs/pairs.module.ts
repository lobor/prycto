import { Module } from '@nestjs/common';
import { PairsResolver } from './pairs.resolver';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { UserImport } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [ExchangeImport, UserImport],
  providers: [PairsResolver, AppService, ExchangeService, UserService],
})
export class PairsModule {}

import { Module } from '@nestjs/common';
import { PairsResolver } from './pairs.resolver';
import { ExchangeModule } from 'src/exchanges/module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, ExchangeModule, CcxtServiceModule],
  providers: [PairsResolver],
})
export class PairsModule {}

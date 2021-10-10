import { forwardRef, Module } from '@nestjs/common';
import { EchangeResolver } from './resolver';
import { ExchangeService } from './service';
import { ExchangeImport } from './exchange.schema';
import { AppService } from '../app.service';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { UserModule } from 'src/user/user.module';
import { BscModule } from 'src/bsc/bsc.module';

@Module({
  imports: [ExchangeImport, CcxtServiceModule, UserModule, BscModule],
  providers: [EchangeResolver, ExchangeService, AppService],
  exports: [ExchangeService],
})
export class ExchangeModule {}

import { forwardRef, Module } from '@nestjs/common';
import { BscModule } from 'src/bsc/bsc.module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { CoursModule } from 'src/cours/cours.module';
import { ExchangeModule } from 'src/exchanges/module';
import { PredictModule } from 'src/predict/predict.module';
import { SocketExchangeModule } from 'src/socketExchange/socketExchange.module';
import { UserModule } from 'src/user/user.module';
import { PredictImport } from '../predict/predict.schema';
import { PositionsResolver } from './positions.resolver';
import { PositionImport } from './positions.schema';
import { PositionsService } from './positions.service';

@Module({
  imports: [
    PositionImport,
    UserModule,
    PredictImport,
    ExchangeModule,
    CcxtServiceModule,
    CoursModule,
    forwardRef(() => SocketExchangeModule),
    PredictModule,
    BscModule,
  ],
  providers: [PositionsService, PositionsResolver],
  exports: [PositionsService],
})
export class PositionsModule {}

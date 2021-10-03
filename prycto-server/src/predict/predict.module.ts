import { Module } from '@nestjs/common';
import { PredictResolver } from './predict.resolver';
import { PredictService } from './predict.service';
import { PredictImport } from './predict.schema';
import { ExchangeModule } from 'src/exchanges/module';
import { CoursModule } from 'src/cours/cours.module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { UserModule } from 'src/user/user.module';
import { PositionImport } from 'src/positions/positions.schema';
import { PositionsService } from 'src/positions/positions.service';
import { CoursImport } from 'src/cours/cours.schema';

@Module({
  imports: [
    CoursImport,
    PositionImport,
    ExchangeModule,
    CoursModule,
    UserModule,
    CcxtServiceModule,
    PredictImport,
  ],
  providers: [PredictResolver, PredictService, PositionsService],
  exports: [PredictService],
})
export class PredictModule {}

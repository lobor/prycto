import { Module } from '@nestjs/common';
import { AppService } from '../app.service';
import { CoursImport } from '../cours/cours.schema';
import { CoursService } from '../cours/cours.service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { PredictResolver } from './predict.resolver';
import { PredictService } from './predict.service';
import { PositionsService } from '../positions/positions.service';
import { PositionImport } from '../positions/positions.schema';
import { PredictImport } from './predict.schema';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';

@Module({
  imports: [
    CoursImport,
    ExchangeImport,
    PositionImport,
    PredictImport,
    UserImport,
  ],
  providers: [
    PredictResolver,
    PredictService,
    CoursService,
    AppService,
    ExchangeService,
    PositionsService,
    UserService,
  ],
})
export class PredictModule {}

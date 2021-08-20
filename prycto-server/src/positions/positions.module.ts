import { Module } from '@nestjs/common';
import { AppService } from '../app.service';
import { CoursImport } from '../cours/cours.schema';
import { CoursService } from '../cours/cours.service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { PredictImport } from '../predict/predict.schema';
import { PredictService } from '../predict/predict.service';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { UserImport } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { PositionsResolver } from './positions.resolver';
import { PositionImport } from './positions.schema';
import { PositionsService } from './positions.service';

@Module({
  imports: [
    PositionImport,
    ExchangeImport,
    UserImport,
    CoursImport,
    PredictImport,
  ],
  providers: [
    PositionsService,
    ExchangeService,
    PositionsResolver,
    AppService,
    SocketExchangeService,
    PubSubService,
    UserService,
    PredictService,
    CoursService,
  ],
})
export class PositionsModule {}

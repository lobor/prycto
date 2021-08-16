import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { CoursImport } from 'src/cours/cours.schema';
import { CoursService } from 'src/cours/cours.service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { ExchangeService } from 'src/exchanges/service';
import { PredictResolver } from './predict.resolver';
import { PredictService } from './predict.service';

@Module({
  imports: [CoursImport, ExchangeImport],
  providers: [
    PredictResolver,
    PredictService,
    CoursService,
    AppService,
    ExchangeService,
  ],
})
export class PredictModule {}

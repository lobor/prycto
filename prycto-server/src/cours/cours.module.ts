import { Module } from '@nestjs/common';
import { CoursService } from './cours.service';
import { CoursResolver } from './cours.resolver';
import { CoursImport } from './cours.schema';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { AppService } from 'src/app.service';

@Module({
  imports: [CoursImport, ExchangeImport],
  providers: [CoursService, CoursResolver, ExchangeService, AppService],
})
export class CoursModule {}

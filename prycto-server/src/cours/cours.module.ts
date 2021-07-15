import { Module } from '@nestjs/common';
import { CoursService } from './cours.service';
import { CoursResolver } from './cours.resolver';
import { CoursImport } from './cours.schema';
import { ExchangeService } from 'src/exchanges/service';
import { ExchangeImport } from 'src/exchanges/exchange.schema';
import { AppService } from 'src/app.service';
import { UserService } from 'src/user/user.service';
import { UserImport } from 'src/user/user.schema';

@Module({
  imports: [CoursImport, ExchangeImport, UserImport],
  providers: [
    CoursService,
    CoursResolver,
    ExchangeService,
    AppService,
    UserService,
  ],
})
export class CoursModule {}

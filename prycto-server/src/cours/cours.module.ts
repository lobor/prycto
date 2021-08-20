import { Module } from '@nestjs/common';
import { CoursService } from './cours.service';
import { CoursResolver } from './cours.resolver';
import { CoursImport } from './cours.schema';
import { ExchangeService } from '../exchanges/service';
import { ExchangeImport } from '../exchanges/exchange.schema';
import { AppService } from '../app.service';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';

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

import { Module } from '@nestjs/common';
import { CoursService } from './cours.service';
import { CoursResolver } from './cours.resolver';
import { CoursImport } from './cours.schema';
import { UserService } from '../user/user.service';
import { UserImport } from '../user/user.schema';
import { ExchangeModule } from '../exchanges/module';
import { CcxtServiceModule } from '../ccxt/ccxt.module';

@Module({
  imports: [CoursImport, UserImport, ExchangeModule, CcxtServiceModule],
  providers: [CoursService, CoursResolver, UserService],
  exports: [CoursService],
})
export class CoursModule {}

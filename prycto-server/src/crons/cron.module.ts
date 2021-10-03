import { Module } from '@nestjs/common';
import { ExchangeModule } from 'src/exchanges/module';
import { PositionsModule } from 'src/positions/positions.module';
import { CcxtServiceModule } from 'src/ccxt/ccxt.module';
import { CoursModule } from 'src/cours/cours.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    CoursModule,
    UserModule,
    ExchangeModule,
    PositionsModule,
    CcxtServiceModule,
    CoursModule,
  ],
})
export class CronsModule {}

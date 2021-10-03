import { Module } from '@nestjs/common';
import { InitResolver } from './init.resolver';
import { ExchangeModule } from '../exchanges/module';

@Module({
  imports: [ExchangeModule],
  providers: [InitResolver],
})
export class InitModule {}

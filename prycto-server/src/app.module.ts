import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ExchangeModule } from './exchanges/module';
import GraphQLJSON from 'graphql-type-json';
import { MongooseModule } from '@nestjs/mongoose';
import { InitModule } from './init/init.module';
import { LoggingPlugin } from './app.plugin';
import { PositionsModule } from './positions/positions.module';
import { MarketsModule } from './markets/markets.module';
import { PairsModule } from './pairs/pairs.module';
import { AppService } from './app.service';
import { ExchangeService } from './exchanges/service';
import { ExchangeImport } from './exchanges/exchange.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketBinanceService } from './socket-binance/socket-binance.service';
import { PositionsService } from './positions/positions.service';
import { PositionImport } from './positions/positions.schema';
import { PubSubService } from './pub-sub/pub-sub.service';
import { CoursModule } from './cours/cours.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
      resolvers: { JSON: GraphQLJSON },
      subscriptions: {
        keepAlive: 5000,
      },
      context: ({ req }) => {
        return {
          exchangeId: ((req && req.headers) || {}).exchangeid,
        };
      },
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ExchangeModule,
    InitModule,
    PositionsModule,
    MarketsModule,
    PairsModule,
    ExchangeImport,
    PositionImport,
    CoursModule,
  ],
  controllers: [],
  providers: [
    LoggingPlugin,
    AppService,
    ExchangeService,
    PositionsService,
    SocketBinanceService,
    PubSubService,
  ],
})
export class AppModule {}

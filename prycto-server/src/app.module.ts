import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ExchangeModule } from './exchanges/module';
import GraphQLJSON from 'graphql-type-json';
import { MongooseModule } from '@nestjs/mongoose';
import { InitModule } from './init/init.module';
// import { Exchange, ExchangeSchema } from './schemas/echange.schema';
import { LoggingPlugin } from './app.plugin';
import { PositionsModule } from './positions/positions.module';
import { MarketsModule } from './markets/markets.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      resolvers: { JSON: GraphQLJSON },
      context: ({ req }) => ({
        exchangeId: req.headers.exchangeid,
      }),
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ExchangeModule,
    InitModule,
    PositionsModule,
    MarketsModule,
  ],
  controllers: [],
  providers: [LoggingPlugin],
})
export class AppModule {}

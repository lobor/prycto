import { Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  requestDidStart(ctx): GraphQLRequestListener {
    const start = Date.now();
    const nameOperation = ctx.request.operationName;
    ctx.logger.info(`request:graphql:nameOperation:${nameOperation}`);
    // ctx.logger.info({
    //   side: 'request',
    //   microservice: 'graphql',
    //   controller: nameOperation,
    // });
    return {
      willSendResponse(ctxResponse) {
        ctxResponse.logger.info(
          `request:graphql:nameOperation:${nameOperation} - ${Date.now() - start}ms`,
        );
        // ctxResponse.logger.info({
        //   side: 'response',
        //   microservice: 'graphql',
        //   controller: nameOperation,
        //   executionTime: Date.now() - start,
        // });
      },
    };
  }
}

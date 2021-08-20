import { Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { Logger } from '@nestjs/common';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger('graphql');
  requestDidStart(ctx): GraphQLRequestListener {
    const start = Date.now();
    const nameOperation = ctx.request.operationName;
    return {
      willSendResponse: () => {
        this.logger.log(
          `response:graphql:${nameOperation} - ${Date.now() - start}ms`,
        );
      },
      didEncounterErrors: (e) => {
        this.logger.error(
          `response:graphql:${nameOperation}`,
          e.errors[0].message,
        );
      },
    };
  }
}

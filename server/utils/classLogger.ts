
import { MethodLoggerParams } from './methodLogger';

export interface ClassLoggerParams extends Omit<MethodLoggerParams, 'name'> {
  name: string;
}

/**
 * Decorators to log class methods call
 *
 * @export
 * @param {MethodLoggerParams} [params={}]
 * @param {boolean} [params.logError=true] Pass `false` if you don't want log error
 * @param {boolean} [params.logSuccess=false] Pass `true` if you want to log success
 * @param {pino.Logger} [params.logger=defaultLogger] Logger
 * @param {boolean} [params.time=true] Pass `false` if you don't want execution time in log
 * @returns
 */
export function ClassLogger({
  logError = true,
  logSuccess = false,
  logger = console,
  name,
  time = true,
}: ClassLoggerParams) {
  return <T extends { new (...args: any[]): any }>(constructor: T) => {
    return class extends constructor {
      /*
       * private modifiers are commented to avoid TS errors
       * see https://github.com/microsoft/TypeScript/issues/30355
       * */

      /* private */ logger = logger;

      /* private */ methodLoggerOptions = {
        logError,
        logSuccess,
        logger,
        name,
        time,
      };
    };
  };
}

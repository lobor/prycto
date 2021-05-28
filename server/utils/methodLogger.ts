export interface MethodLoggerParams {
  className?: string;
  level?: string;
  logError?: boolean;
  logSuccess?: boolean;
  logger?: Console;
  time?: boolean;
}

const defaultLogger = console

/**
 * Decorators to log class methods call
 *
 * @export
 * @param {MethodLoggerParams} [params={}]
 * @param {string} [params.className=target.constructor.name]
 * @param {boolean} [params.logError=true] Pass `false` if you don't want log error
 * @param {boolean} [params.logSuccess=false] Pass `true` if you want to log success
 * @param {pino.Logger} [params.logger=defaultLogger] Logger
 * @param {boolean} [params.time=true] Pass `false` if you don't want execution time in log
 * @returns
 */
export function MethodLogger(methodLoggerOptions: MethodLoggerParams = {}) {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (!descriptor) {
      throw new Error('MethodLogger does not support arrow function');
    }

    const newDescriptor = descriptor;
    const method = newDescriptor.value;

    if (typeof method === 'function' && target && target.constructor) {
      const logMessage = (message: string, name: string) => `${name}:${propertyName} - ${message}`;
      newDescriptor.value = function handleResponse(
        this: { methodLoggerOptions?: Omit<MethodLoggerParams, 'className'> & { name?: string } },
        ...args: any[]
      ) {
        const options = {
          ...methodLoggerOptions,
          logger:
            methodLoggerOptions.logger ||
            (this.methodLoggerOptions && this.methodLoggerOptions.logger) ||
            defaultLogger,
        };
        if (!options.level && this.methodLoggerOptions && this.methodLoggerOptions.level) {
          options.level = this.methodLoggerOptions.level;
        }
        if (!options.logger && this.methodLoggerOptions && this.methodLoggerOptions.logger) {
          options.logger = this.methodLoggerOptions.logger;
        } else if (!options.logger) {
          options.logger = defaultLogger;
        }
        if (
          typeof options.logError !== 'boolean' &&
          this.methodLoggerOptions &&
          typeof this.methodLoggerOptions.logError === 'boolean'
        ) {
          options.logError = this.methodLoggerOptions.logError;
        } else if (typeof options.logError !== 'boolean') {
          options.logError = true;
        }
        if (
          typeof options.logSuccess !== 'boolean' &&
          this.methodLoggerOptions &&
          typeof this.methodLoggerOptions.logSuccess === 'boolean'
        ) {
          options.logSuccess = this.methodLoggerOptions.logSuccess;
        } else if (typeof options.logSuccess !== 'boolean') {
          options.logSuccess = false;
        }
        if (
          typeof options.time !== 'boolean' &&
          this.methodLoggerOptions &&
          typeof this.methodLoggerOptions.time === 'boolean'
        ) {
          options.time = this.methodLoggerOptions.time;
        } else if (typeof options.time !== 'boolean') {
          options.time = true;
        }

        const now = Date.now();
        let name: string = methodLoggerOptions.className || target.constructor.name;
        if (this.methodLoggerOptions && this.methodLoggerOptions.name) {
          name = this.methodLoggerOptions.name;
        }

        // options.logger.debug(args, logMessage('Arguments', name));

        try {
          const res = method.call(this, ...args);
          const isPromise =
            res &&
            typeof res === 'object' &&
            typeof res.catch === 'function' &&
            typeof res.then === 'function';

          if (isPromise) {
            if (options.logSuccess) {
              res.then(() => {
                options.logger!.info(
                  logMessage(`Success${options.time ? ` in ${Date.now() - now}ms` : ''}`, name),
                );
              });
            }

            if (options.logError) {
              res.catch((err: Error) => {
                options.logger.error(err, logMessage(err.message, name));
              });
            }
          } else if (options.logSuccess) {
            options.logger.info(
              logMessage(`Success${options.time ? ` in ${Date.now() - now}ms` : ''}`, name),
            );
          }

          return res;
        } catch (err) {
          if (options.logError) {
            options.logger.error(err, logMessage(err.message, name));
          }

          throw err;
        }
      };
    } else {
      throw new Error(
        'Decorators - MethodLogger: You should only use this decorator on a class method.',
      );
    }

    return newDescriptor;
  };
}

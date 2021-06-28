import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { flatten } from 'lodash';
import { ExchangeService } from './exchanges/service';
import * as CryptoJS from 'crypto-js';

const secret = 'secret key 123';

export interface addExchangeParams {
  _id: string;
  name: string;
  exchange: ccxt.ExchangeId;
  publicKey: string;
  secretKey: string;
}

@Injectable()
export class AppService {
  private exchanges: { [key: string]: ccxt.Exchange } = {};

  encrypt = (msg: string) => {
    return CryptoJS.AES.encrypt(msg, secret).toString();
  };

  decrypt = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  public fetchOHLCV(
    exchangeId: string,
    symbol: string,
    timeframe?: string | undefined,
    since?: number | undefined,
    limit?: number | undefined,
    params?: ccxt.Params | undefined,
  ) {
    return this.exchanges[exchangeId].fetchOHLCV(
      symbol,
      timeframe,
      since,
      limit,
      params,
    );
  }

  public addExchange(exchange: any) {
    this.exchanges[exchange._id] = new ccxt[exchange.exchange]({
      enableRateLimit: true,
      timeout: 30000,
      apiKey: exchange.publicKey,
      secret: exchange.secretKey,
    });
  }

  public async loadMarkets() {
    await Promise.all(
      Object.keys(this.exchanges).map(async (idExchange) => {
        const exchange = this.exchanges[idExchange];
        await exchange.loadMarkets();
      }),
    );
  }

  public async getHistoryByExchangeId(params: {
    exchangeId: string;
    pairs: string[];
  }) {
    const exchange = this.exchanges[params.exchangeId];
    const orders = flatten(
      await Promise.all(
        params.pairs.map(async (symbol) => {
          return exchange.fetchOrders(symbol, undefined, undefined, {
            recvWindow: 60000,
          });
        }),
      ),
    );
    return orders;
  }

  public async getCurrencies(params: { [exchangeId: string]: string[] }) {
    const callPromise: Promise<any>[] = [];
    Object.keys(params).forEach(async (idExchange) => {
      const exchange = this.exchanges[idExchange];
      const pairs = params[idExchange];
      callPromise.push(
        (async () => {
          const pairsTickers = Object.values(
            await exchange.fetchTickers(pairs),
          );
          return {
            idExchange,
            pairs: pairsTickers,
          };
        })(),
      );
    });
    const currencies = await Promise.all(callPromise);
    return currencies;
  }

  public async getCurrenciesByPair(params: {
    exchangeId: string;
    symbol: string;
  }) {
    const exchange = this.exchanges[params.exchangeId];
    return {
      idExchange: params.exchangeId,
      pairs: await exchange.fetchTickers([params.symbol]),
    };
  }

  public async getMarkets() {
    const markets = flatten(
      await Promise.all(
        Object.keys(this.exchanges).map(async (idExchange) => {
          const exchange = this.exchanges[idExchange];
          return {
            _id: idExchange,
            markets: await exchange.fetchMarkets(),
          };
        }),
      ),
    );
    return markets;
  }

  public async getBalances(exchangesToGet: { _id: string }[]) {
    const balances = flatten(
      await Promise.all(
        exchangesToGet.map(({ _id }) => {
          if (this.exchanges[_id]) {
            return this.exchanges[_id].fetchBalance({ recvWindow: 60000 });
          }
        }),
      ),
    );
    const balancesValidate = exchangesToGet.reduce<{
      [exchangeId: string]: Record<string, unknown>;
    }>((acc, { _id }) => {
      if (!acc[_id]) {
        acc[_id] = {};
      }
      return acc;
    }, {});

    balances.forEach((balance, index) => {
      if (balance) {
        const exchange = exchangesToGet[index];
        Object.keys(balance.total).forEach((key) => {
          if ((balance.total as unknown as any)[key] > 0) {
            balancesValidate[exchange._id][key] = (
              balance.total as unknown as any
            )[key];
          }
        });
      }
    });
    return balancesValidate;
  }
}
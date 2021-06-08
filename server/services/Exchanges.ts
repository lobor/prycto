// import { flatten } from "lodash";
// import Binance from "../interfaces/Binance";
// import Ftx from "../interfaces/Ftx";
// import config from "../config";
import ccxt from "ccxt";
import { flatten } from "lodash";
import { ClassLogger } from "../utils/classLogger";
import { MethodLogger } from "../utils/methodLogger";

export interface addExchangeParams {
  _id: string;
  name: string;
  exchange: ccxt.ExchangeId;
  publicKey: string;
  secretKey: string;
}

@ClassLogger({ name: "Exchanges" })
export default class Exchanges {
  private exchanges: { [key: string]: ccxt.Exchange } = {};

  @MethodLogger({ logSuccess: true })
  public addExchange(exchange: addExchangeParams) {
    this.exchanges[exchange._id] = new ccxt[exchange.exchange]({
      enableRateLimit: true,
      timeout: 30000,
      apiKey: exchange.publicKey,
      secret: exchange.secretKey,
    });
  }

  @MethodLogger({ logSuccess: true })
  public async loadMarkets() {
    await Promise.all(
      Object.keys(this.exchanges).map(async (idExchange) => {
        const exchange = this.exchanges[idExchange];
        await exchange.loadMarkets();
      })
    );
  }

  @MethodLogger({ logSuccess: true })
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
        })
      )
    );
    return orders;
  }

  @MethodLogger({ logSuccess: true })
  public async getCurrencies(params: { [exchangeId: string]: string[] }) {
    const callPromise: Promise<any>[] = [];
    Object.keys(params).forEach(async (idExchange) => {
      const exchange = this.exchanges[idExchange];
      const pairs = params[idExchange];
      callPromise.push(
        (async () => {
          const pairsTickers = Object.values(await exchange.fetchTickers(pairs));
          return {
            idExchange,
            pairs: pairsTickers,
          };
        })()
      );
    });
    const currencies = await Promise.all(callPromise);
    return currencies;
  }

  @MethodLogger({ logSuccess: true })
  public async getMarkets() {
    const markets = flatten(
      await Promise.all(
        Object.keys(this.exchanges).map(async (idExchange) => {
          const exchange = this.exchanges[idExchange];
          return {
            _id: idExchange,
            markets: await exchange.fetchMarkets(),
          };
        })
      )
    );
    return markets;
  }

  @MethodLogger({ logSuccess: true })
  public async getBalances(exchangesToGet: { _id: string }[]) {
    const balances = flatten(
      await Promise.all(
        exchangesToGet.map(({ _id }) => {
          if (this.exchanges[_id]) {
            return this.exchanges[_id].fetchBalance({ recvWindow: 60000 });
          }
        })
      )
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
          if (balance.total[key] > 0) {
            balancesValidate[exchange._id][key] = balance.total[key];
          }
        });
      }
    });
    return balancesValidate;
  }
}

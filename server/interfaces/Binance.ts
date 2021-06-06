import {
  AssetBalance,
  Binance as BinanceInstance,
  CandleChartInterval,
  QueryOrderResult,
  ReconnectingWebSocketHandler,
} from "binance-api-node";
import { Db } from "mongodb";
import { flatten, orderBy } from "lodash";
import promiseLimit from "promise-limit";
import config from "../config";
import { ClassLogger } from "../utils/classLogger";
import { MethodLogger } from "../utils/methodLogger";

var limit = promiseLimit(1);

@ClassLogger({ name: "Binance" })
class Binance {
  private binance: BinanceInstance;
  private db: Db;
  private balances: AssetBalance[] = [];
  private unsubscribeSocket?: ReconnectingWebSocketHandler;

  constructor(binance: BinanceInstance, db: Db) {
    this.binance = binance;
    this.db = db;
    this.binance.accountInfo().then((user) => {
      this.balances.push(
        ...user.balances.filter(({ free, asset }) => {
          return Number(free) > 0;
        })
      );
    });
  }

  @MethodLogger({ logSuccess: true })
  public async getAllPairs() {
    return this.binance.exchangeInfo();
  }

  @MethodLogger({ logSuccess: true })
  public async getPrices() {
    const pairs = this.getPairs();
    const allPairs = await Promise.all(
      pairs.map((pair) => this.binance.prices({ symbol: pair }))
    );
    return allPairs.reduce((acc, pair) => {
      return { ...acc, ...pair };
    }, {});
  }

  @MethodLogger({ logSuccess: true })
  public getMarket(cb: (params: { [key: string]: string }) => void) {
    this.unsubscribeSocket = this.binance.ws.trades(
      this.getPairs(),
      (trade) => {
        cb({ [trade.symbol]: trade.price });
      }
    );
  }

  @MethodLogger({ logSuccess: true })
  private getPairs(): string[] {
    return config.get("pairs:binance");
  }

  @MethodLogger({ logSuccess: true })
  public async getHistoryExchange(pair: string) {
    const collection = this.db.collection("history");
    const histories = await collection
      .find({ symbol: pair })
      .sort({ time: -1 })
      .toArray();
    const params = { symbol: pair };
    if (histories.length > 0) {
      params.orderId = histories[0].orderId;
    }
    // const orders = await this.binance.allOrders(params);
    // const historiesByOrderid = histories.map(({ orderId }) => orderId);
    // const orderToAdd = orders.filter(
    //   ({ orderId }) => !historiesByOrderid.includes(orderId)
    // );
    // if (orderToAdd.length > 0) {
    //   collection.insertMany(orderToAdd);
    // }
    return [...histories, ...[]];
  }

  @MethodLogger({ logSuccess: true })
  public unsubscribe() {
    if (this.unsubscribeSocket) {
      this.unsubscribeSocket();
      this.unsubscribeSocket = undefined;
    }
  }

  @MethodLogger({ logSuccess: true })
  public async addPosition(pair: string) {
    await this.getHistoryExchange(pair);
  }

  @MethodLogger({ logSuccess: true })
  public async getHistoryCache(): Promise<{
    historyOrderByPair: { [key: string]: QueryOrderResult[] };
    historyOrder: QueryOrderResult[];
  }> {
    const pairs = this.getPairs();
    const historyOrder = flatten(
      await Promise.all(
        pairs.map(async (pair) => limit(() => this.getHistoryExchange(pair)))
      )
    );
    const historyOrderByPair: Record<string, (QueryOrderResult | any)[]> = {};
    pairs.forEach((pair) => {
      if (!historyOrderByPair[pair]) {
        historyOrderByPair[pair] = [];
      }
      historyOrderByPair[pair].push(
        ...historyOrder.filter(({ symbol }) => symbol === pair)
      );
    });
    return { historyOrderByPair, historyOrder };
  }

  public async getHistoryPrice() {
    const pairs = this.getPairs();
    const historiesProfit: { [key: number]: { [key: string]: number } } = {};
    await Promise.all(
      pairs.map(async (pair) => {
        const toto = await this.binance.candles({
          symbol: pair,
          interval: CandleChartInterval.ONE_DAY,
        });
        const histories = await this.getHistoryExchange(pair);
        const [historic] = orderBy(histories, "time");
        let investment = 0;
        let available = 0;
        toto
          .filter(({ closeTime }) => {
            return !historic || closeTime >= historic.time;
          })
          .forEach((history) => {
            const historiesDay = histories.filter(({ time }) => {
              return history.openTime <= time && history.closeTime >= time;
            });
            historiesDay.forEach((order) => {
              if (order.status === "FILLED") {
                if (order.side === "BUY") {
                  investment += Number(order.cummulativeQuoteQty);
                  available += Number(order.executedQty);
                }
                if (order.side === "SELL") {
                  investment -= Number(order.cummulativeQuoteQty);
                  available -= Number(order.executedQty);
                }
              }
            });
            const { close, closeTime } = history;
            if (!historiesProfit[closeTime]) {
              historiesProfit[closeTime] = { time: closeTime };
            }
            historiesProfit[closeTime][pair] =
              available * Number(close) - investment;
          });
      })
    );
    return Object.values(historiesProfit);
  }

  @MethodLogger({ logSuccess: true })
  public async getPositions() {
    const collection = this.db.collection("position");
    return collection.find({}).toArray();
  }

  @MethodLogger({ logSuccess: true })
  public async updatePositions() {
    const pairs = this.getPairs();
    const { historyOrderByPair } = await this.getHistoryCache();
    const positions: {
      pair: string;
      investment: number;
      available: number;
      exchange: string;
    }[] = [];
    pairs.forEach((pairConfig) => {
      const goodPair = Object.keys(historyOrderByPair).find((pair) => {
        return pairConfig === pair;
      });
      const position = {
        exchange: "binance",
        pair: goodPair || pairConfig,
        investment: 0,
        available: 0,
      };
      if (goodPair) {
        const balance = this.balances.find((balance) => {
          return new RegExp(`^${balance.asset}`).exec(goodPair);
        });
        let investment = 0;
        const orders = historyOrderByPair[goodPair];
        orders.forEach((order) => {
          if (order.status === "FILLED") {
            if (order.side === "BUY") {
              investment += Number(order.cummulativeQuoteQty);
            }
            if (order.side === "SELL") {
              investment -= Number(order.cummulativeQuoteQty);
            }
          }
        });
        position.investment = investment < 0 ? 0 : investment;
        position.available =
          (balance && Number(balance.free) + Number(balance.locked)) || 0;
      }
      positions.push(position);
    });
    const collection = this.db.collection("position");
    await collection.bulkWrite(
      positions.map((position) => {
        return {
          updateOne: {
            filter: { pair: position.pair },
            update: { $set: { investment: position.investment, available: position.available } },
          },
        };
      })
    );
    return positions;
  }
}

export default Binance;

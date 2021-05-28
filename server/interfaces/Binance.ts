import {
  AssetBalance,
  Binance as BinanceInstance,
  QueryOrderResult,
  ReconnectingWebSocketHandler,
} from "binance-api-node";
import { flatten } from "lodash";
import fs from "fs";
import { promisify } from "util";
import config from "../config";
import { ClassLogger } from '../utils/classLogger'
import { MethodLogger } from '../utils/methodLogger'

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


@ClassLogger({ name: 'Binance' })
class Binance {
  private binance: BinanceInstance;
  private balances: AssetBalance[] = [];
  private unsubscribeSocket?: ReconnectingWebSocketHandler;

  constructor(binance: BinanceInstance) {
    this.binance = binance;
    this.binance.accountInfo().then((user) => {
      this.balances.push(
        ...user.balances.filter(({ free, asset }) => {
          return Number(free) > 0;
        })
      );
    });
  }

  @MethodLogger({ logSuccess: true })
  public getAllPairs () {
    return this.binance.exchangeInfo()
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
    const orders = await this.binance.allOrders({ symbol: pair });
    await writeFile(`./.tmp/binance_${pair}.json`, JSON.stringify(orders));
    return orders;
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
    await this.getHistoryCacheByPair(pair);
  }

  @MethodLogger({ logSuccess: true })
  private async getHistoryCacheByPair(pair: string) {
    let data: any[] = [];
    try {
      data = JSON.parse(
        (await readFile(`./.tmp/binance_${pair}.json`)).toString()
      );
    } catch (e) {
      data = await this.getHistoryExchange(pair);
    }
    return data;
  }

  @MethodLogger({ logSuccess: true })
  public async getHistoryCache(): Promise<{
    historyOrderByPair: { [key: string]: QueryOrderResult[] };
    historyOrder: QueryOrderResult[];
  }> {
    const pairs = this.getPairs();
    const historyOrder = flatten(
      await Promise.all(
        pairs.map(async (pair) => this.getHistoryCacheByPair(pair))
      )
    );
    const historyOrderByPair = historyOrder.reduce<
      Record<string, (QueryOrderResult | any)[]>
    >((acc, order) => {
      const key = order.symbol || order.market;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(order);
      return acc;
    }, {});
    return { historyOrderByPair, historyOrder };
  }

  @MethodLogger({ logSuccess: true })
  public async getPositions() {
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
    return positions;
  }
}

export default Binance;

import BinanceMethod, {
  AssetBalance,
  Binance as BinanceInstance,
  QueryOrderResult,
  ReconnectingWebSocketHandler,
} from "binance-api-node";
import { flatten } from "lodash";
import fs from "fs";
import { promisify } from "util";
import config from "../config";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class Binance {
  private binance: BinanceInstance;
  private balances: AssetBalance[] = [];
  private unsubscribeSocket?: ReconnectingWebSocketHandler;
  constructor(binance: BinanceInstance) {
    this.binance = binance;
    this.binance.accountInfo().then((user) => {
      this.balances.push(
        ...user.balances.filter(({ free }) => Number(free) > 0)
      );
    });
  }

  public getMarket(cb: (params: { [key: string]: string }) => void) {
    this.unsubscribeSocket = this.binance.ws.trades(this.getPairs(), (trade) => {
      cb({ [trade.symbol]: trade.price });
    });
  }

  private getPairs(): string[] {
    return config.get("pairs:binance");
  }

  public async getHistoryExchange(pair: string) {
    const orders = await this.binance.allOrders({ symbol: pair });
    await writeFile(`./.tmp/binance_${pair}.json`, JSON.stringify(orders));
    return orders;
  }

  public unsubscribe () {
    if (this.unsubscribeSocket) {
      this.unsubscribeSocket()
      this.unsubscribeSocket = undefined;
    }
  }

  public async getHistoryCache(): Promise<{
    historyOrderByPair: { [key: string]: QueryOrderResult[] };
    historyOrder: QueryOrderResult[];
  }> {
    const pairs = this.getPairs();
    const historyOrder = flatten(
      await Promise.all([
        ...pairs.map(async (pair) => {
          let data: any[] = []
          try {
            data = JSON.parse(
              (await readFile(`./.tmp/binance_${pair}.json`)).toString()
            )
          } catch (e) {
            data = await this.getHistoryExchange(pair)
          }
          return data;
        }),
      ])
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

  public async getPositions() {
    const pairs = this.getPairs();
    const { historyOrderByPair } = await this.getHistoryCache();
    const positions: {
      pair: string;
      investment: number;
      available: number;
      exchange: string;
    }[] = [];
    await Promise.all(
      pairs.map(async (pairConfig) => {
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
          position.available = (balance && Number(balance.free)) || 0;
        }
        positions.push(position);
      })
    );
    return positions;
  }
}

export default Binance;

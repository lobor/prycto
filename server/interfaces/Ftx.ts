import { RestClient, WebsocketClient } from "ftx-api";
import fs from "fs";
import { promisify } from "util";
import config from "../config";
import { flatten } from "lodash";
import { ClassLogger } from "../utils/classLogger";
import { MethodLogger } from "../utils/methodLogger";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

@ClassLogger({ name: "Ftx" })
class Ftx {
  private rest: RestClient;
  private ws: WebsocketClient;
  private balances: {
    coin: string;
    free: number;
    total: number;
  }[] = [];
  constructor({ ws, rest }: { ws: WebsocketClient; rest: RestClient }) {
    this.ws = ws;
    this.rest = rest;
    this.rest.getBalances().then(
      ({
        result,
      }: {
        result: {
          coin: string;
          free: number;
          total: number;
        }[];
      }) => {
        this.balances.push(...result.filter(({ free }) => Number(free) > 0));
      }
    );
  }

  @MethodLogger({ logSuccess: true })
  public unsubscribe() {
    this.ws.unsubscribe(
      this.getPairs().map((trade) => {
        return {
          channel: "trades",
          market: trade,
        };
      })
    );
  }

  @MethodLogger({ logSuccess: true })
  private async getHistoryCacheByPair(pair: string) {
    let data: any[] = [];
    try {
      data = JSON.parse(
        (await readFile(`./.tmp/ftx_${pair.replace("/", "_")}.json`)).toString()
      );
    } catch (e) {
      data = await this.getHistoryExchange(pair);
    }
    return data;
  }

  @MethodLogger({ logSuccess: true })
  public async addPosition(pair: string) {
    await this.getHistoryCacheByPair(pair);
  }

  @MethodLogger({ logSuccess: true })
  public async getAllPairs(): Promise<{ name: string; price: number }[]> {
    const { result } = await this.rest.getMarkets();
    return result;
  }

  @MethodLogger({ logSuccess: true })
  public async getHistoryExchange(pair: string) {
    const ordersFtx = await this.rest.getOrderHistory({ market: pair });
    await writeFile(
      `./.tmp/ftx_${pair.replace("/", "_")}.json`,
      JSON.stringify(ordersFtx.result)
    );
    return ordersFtx.result;
  }

  @MethodLogger({ logSuccess: true })
  public async getHistoryCache(): Promise<{
    historyOrderByPair: { [key: string]: any[] };
    historyOrder: any[];
  }> {
    const pairs = this.getPairs();
    const historyOrder = flatten(
      await Promise.all(
        pairs.map(async (pair) => this.getHistoryCacheByPair(pair))
      )
    );
    const historyOrderByPair = historyOrder.reduce<Record<string, any[]>>(
      (acc, order) => {
        const key = order.symbol || order.market;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(order);
        return acc;
      },
      {}
    );
    return { historyOrderByPair, historyOrder };
  }

  @MethodLogger({ logSuccess: true })
  private getPairs(): string[] {
    return config.get("pairs:ftx");
  }

  @MethodLogger({ logSuccess: true })
  public async getPrices(): Promise<{ [key: string]: number }> {
    const prices = await this.getAllPairs();
    const pairs = this.getPairs();
    const pricesPair = prices.filter(({ name }) => pairs.includes(name));
    const pricesParsed: { [key: string]: number } = {};
    pricesPair.forEach(({ name, price }) => {
      pricesParsed[name] = price;
    });
    return pricesParsed;
  }

  @MethodLogger({ logSuccess: true })
  public getMarket(cb: (params: { [key: string]: string }) => void) {
    this.ws.on("update", (msg) => {
      if (msg.channel === "trades") {
        const [trade] = msg.data || [];
        if (trade) {
          cb({ [msg.market]: trade.price });
        }
      }
    });
    this.ws.on("error", (msg) => console.log("err: ", msg));
    this.ws.subscribe(
      this.getPairs().map((trade) => {
        return {
          channel: "trades",
          market: trade,
        };
      })
    );
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
    pairs.map(async (pairConfig) => {
      const goodPair = Object.keys(historyOrderByPair).find((pair) => {
        return pairConfig === pair.replace("-", "/");
      });
      if (goodPair) {
        const balance = this.balances.find((balance) => {
          return new RegExp(`^${balance.coin}`).exec(goodPair);
        });
        let investment = 0;
        const orders = historyOrderByPair[goodPair];
        orders.forEach((order) => {
          if (order.status === "closed") {
            if (order.side === "buy") {
              investment += Number(order.avgFillPrice * order.size);
            }
            if (order.side === "sell") {
              investment -= Number(order.avgFillPrice * order.size);
            }
          }
        });
        positions.push({
          exchange: "ftx",
          pair: goodPair,
          investment: investment < 0 ? 0 : investment,
          available: (balance && Number(balance.free)) || 0,
        });
      } else {
        positions.push({
          exchange: "ftx",
          pair: pairConfig,
          investment: 0,
          available: 0,
        });
      }
    });
    return positions;
  }
}

export default Ftx;

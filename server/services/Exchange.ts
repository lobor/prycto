import { flatten } from "lodash";
import Binance from "../interfaces/Binance";
import Ftx from "../interfaces/Ftx";
import config from "../config";

export default class Exchange {
  private binance?: Binance;
  private ftx?: Ftx;

  constructor({ binance, ftx }: { binance?: Binance; ftx?: Ftx }) {
    this.binance = binance;
    this.ftx = ftx;
  }

  public unsubscribe() {
    if (this.binance) {
      this.binance.unsubscribe();
    }
    if (this.ftx) {
      this.ftx.unsubscribe();
    }
  }

  public async getAllPairs() {
    const pairs = [];
    if (this.binance) {
      const { symbols } = await this.binance.getAllPairs();
      pairs.push(
        ...symbols.map(({ symbol }) => {
          return {
            pair: symbol,
            exchange: "binance",
          };
        })
      );
    }
    if (this.ftx) {
      const ftxPairs = await this.ftx.getAllPairs();
      pairs.push(
        ...ftxPairs.map(({ name }) => {
          return {
            pair: name,
            exchange: "ftx",
          };
        })
      );
    }
    return pairs;
  }

  public async addPosition(exchange: string, pair: string) {
    const pairsExchange = config.get(`pairs:${exchange}`);
    pairsExchange.push(pair);
    config.set(`pairs:${exchange}`, pairsExchange);
    await new Promise((resolve, reject) =>
      config.save(async (err: Error | undefined) => {
        if (!err) {
          resolve(undefined);
        } else {
          reject();
        }
      })
    );
    try {
      if (this.binance && exchange === "binance") {
        await this.binance.addPosition(pair);
      }

      if (this.ftx && exchange === "ftx") {
        await this.ftx.addPosition(pair);
      }
    } catch (e) {
      console.log(e);
      pairsExchange.pop();
      await new Promise((resolve, reject) =>
        config.save(async (err: Error | undefined) => {
          if (!err) {
            resolve(undefined);
          } else {
            reject();
          }
        })
      );
      if (e.code && e.body) {
        console.log(e);
        throw e.body.error;
      } else {
        throw e;
      }
    }
  }

  public getMarkets(cb: (params: { [key: string]: string }) => void) {
    if (this.binance) {
      this.binance.getMarket(cb);
    }
    if (this.ftx) {
      this.ftx.getMarket(cb);
    }
  }

  public getHistories() {}

  public async getPositions() {
    const positions = [];
    if (this.binance) {
      positions.push(this.binance.getPositions());
    }
    if (this.ftx) {
      positions.push(this.ftx.getPositions());
    }
    return flatten(await Promise.all(positions));
  }
}

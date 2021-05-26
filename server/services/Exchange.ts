import { flatten } from "lodash";
import { any } from "nconf";
import Binance from "../interfaces/Binance";
import Ftx from "../interfaces/Ftx";

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

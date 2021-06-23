import { Db } from "mongodb";
import { Socket } from "socket.io";

import { exchanges } from "../../context";
import wrapEvent from "../utils/wrapEvent";

export default async (context: { socket: Socket; db: Db }) => {
  wrapEvent(
    "getMarkets",
    async (_, ctx) => {
      const positions = await ctx.db.collection("position").find({}).toArray();
      const positionByExchangesIds = positions.reduce<{
        [exchangeId: string]: string[];
      }>((acc, position) => {
        if (!acc[position.exchangeId]) {
          acc[position.exchangeId] = [];
        }
        !acc[position.exchangeId].push(position.pair);
        return acc;
      }, {});

      const [currencies] = await exchanges.getCurrencies(
        positionByExchangesIds
      );
      if (currencies) {
        ctx.emit(
          currencies.pairs.reduce((acc: any, currency: any) => {
            acc[currency.symbol] = currency.last;
            return acc;
          }, {})
        );
      }
    },
    context
  );
};

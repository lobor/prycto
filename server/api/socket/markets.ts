import { keyBy } from "lodash";
import { Db } from "mongodb";
import { Socket } from "socket.io";

import { exchanges } from "../../context";

export default ({ socket, db }: { socket: Socket; db: Db }) => {
  socket.on("getMarkets:request", async () => {
    const positions = await db.collection("position").find({}).toArray();
    const positionByExchangesIds = positions.reduce<{
      [exchangeId: string]: string[];
    }>((acc, position) => {
      if (!acc[position.exchangeId]) {
        acc[position.exchangeId] = [];
      }
      !acc[position.exchangeId].push(position.pair);
      return acc;
    }, {});

    const [currencies] = await exchanges.getCurrencies(positionByExchangesIds);
    if (currencies) {
      socket.emit(
        "getMarkets:response",
        currencies.pairs.reduce((acc, currency) => {
          acc[currency.symbol] = currency.last;
          return acc;
        }, {})
      );
    }
  });
};

import { Db, FilterQuery, ObjectId } from "mongodb";
import { Socket } from "socket.io";
import wrapEvent from "../utils/wrapEvent";
import { PnlParams } from "../../../type";
import { exchanges } from "../../context";
import { orderBy } from "lodash";
import { addDays, differenceInDays, getDate, isSameDay, subDays } from "date-fns";
import { Order } from "ccxt";

export default (context: { socket: Socket; db: Db }) => {
  wrapEvent(
    "pnl",
    async ({ symbol, exchangeId }: PnlParams, ctx) => {
      const exchange = await ctx.db
        .collection("exchange")
        .findOne({ _id: new ObjectId(exchangeId) });
      if (!exchange) {
        ctx.error(404, "echange not found");
        return;
      }
      const query: FilterQuery<{ exchangeId: string; pair: string }> = {
        exchangeId,
      };
      if (symbol) {
        query.pair = symbol;
      }
      const positions = await ctx.db
        .collection("position")
        .find(query)
        .toArray();

      const byDay: Record<number, number> = {};
      for (const position of positions) {
        const [asset] = position.pair.split("/");
        const exchangeAsset = exchange.balance[asset];
        if (exchangeAsset) {
          let historiesCours = await ctx.db
            .collection("cours")
            .find({ exchangeId, symbol: position.pair })
            .sort({ timestamp: 1 })
            .toArray();

          if (historiesCours.length === 0) {
            historiesCours = await exchanges.fetchOHLCV(
              exchangeId,
              position.pair,
              "1d"
            );
            historiesCours = historiesCours.map(
              ([timestamp, open, high, low, close, volume]) => ({
                exchangeId,
                symbol: position.pair,
                timestamp,
                open,
                high,
                low,
                close,
                volume,
              })
            )
            await ctx.db.collection("cours").insertMany(historiesCours);
          } else if (
            differenceInDays(
              subDays(new Date(), 1),
              new Date(historiesCours[historiesCours.length - 1].timestamp)
            ) > 0
          ) {
            const historyToAdd = await exchanges.fetchOHLCV(
              exchangeId,
              position.pair,
              "1d",
              historiesCours[historiesCours.length - 1].timestamp + 1
            );
            const toInsert = historyToAdd.map(
              ([timestamp, open, high, low, close, volume]) => ({
                exchangeId,
                symbol: position.pair,
                timestamp,
                open,
                high,
                low,
                close,
                volume,
              })
            )
            if (toInsert.length > 0) {
              await ctx.db.collection("cours").insertMany(toInsert);
            }
            historiesCours.push(...toInsert);
          }

          let histories = await ctx.db
            .collection("history")
            .find({ exchangeId, symbol: position.pair })
            .toArray();


          const [historic] = orderBy(histories, "timestamp");
          let investment = 0;
          let available = 0;
          // //[ timestamp, open, high, low, close, volume ]
          historiesCours
            .filter(({ timestamp, open, high, low, close, volume }) => {
              return historic && addDays(timestamp, 1) >= historic.timestamp;
            })
            .forEach(({ timestamp, open, high, low, close, volume }) => {
              histories.forEach((order) => {
                if (isSameDay(
                  new Date(order.timestamp),
                  new Date(timestamp)
                )) {
                  if (order.status === "closed") {
                    if (order.side === "buy") {
                      investment += Number(order.cost);
                      available += Number(order.filled);
                    }
                    if (order.side === "sell") {
                      investment -= Number(order.cost);
                      available -= Number(order.filled);
                    }

                    // if (available < 0) {
                    //   available = 0;
                    // }
                    // console.log(available, new Date(timestamp))
                  }
                }
              });
              byDay[timestamp] =
              available * Number(close) - investment + (byDay[timestamp] || 0);
                // available * Number(close) + (byDay[timestamp] || 0);
            });
        }
      }

      ctx.emit(
        Object.keys(byDay)
          .map((key) => {
            return {
              time: Number(key),
              value: byDay[Number(key)],
            };
          })
          .sort((a, b) => a.time - b.time)
      );
    },
    context
  );
};

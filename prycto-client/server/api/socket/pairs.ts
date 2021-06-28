import { flatten, keyBy } from "lodash";
import { Db, ObjectId } from "mongodb";
import { Socket } from "socket.io";

import { exchanges } from "../../context";

export default ({ socket, db }: { socket: Socket; db: Db }) => {
  socket.on("getAllPairs:request", async () => {
    const markets = await exchanges.getMarkets();
    const exchangesDb = await db.collection("exchange").find({}).toArray();
    const exchangesDbById = exchangesDb.reduce<Record<string, any>>((acc, exchange) => {
      acc[exchange._id] = exchange;
      return acc;
    }, {})
    socket.emit(
      "getAllPairs:response",
      flatten(
        markets.map(({ _id, markets }) => {
          return markets.map((market) => {
            return {
              exchangeId: _id,
              exchange: exchangesDbById[_id].exchange,
              ...market,
            };
          });
        })
      )
    );
  });
};

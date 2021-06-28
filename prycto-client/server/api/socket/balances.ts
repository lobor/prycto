import { Db, ObjectId } from "mongodb";
import { Socket } from "socket.io";

import { exchanges } from "../../context";

export default ({ socket, db }: { socket: Socket; db: Db }) => {
  socket.on("getBalances:request", async () => {
    const exchangeCollection = db.collection("exchange");
    const exchangesBd = await exchangeCollection.find({}).toArray();
    const balances = await exchanges.getBalances(exchangesBd);
    socket.emit(
      "getBalances:response",
      exchangesBd.map((exchange) => {
        return { ...exchange, balances: balances[exchange._id] };
      })
    );
  });

  socket.on(
    "updateBalancesExchange:request",
    async (balance: {
      _id: string;
      balances: { [key: string]: { locked: number; available: number } };
    }) => {
      const collection = db.collection("exchange");
      await collection.updateOne(
        { _id: new ObjectId(balance._id) },
        { $set: { balance: balance.balances } }
      );
      socket.emit("updateBalancesExchange:response", 'ok');
    }
  );
};

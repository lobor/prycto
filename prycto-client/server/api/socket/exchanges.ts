import { Db, ObjectId } from "mongodb";
import { Socket } from "socket.io";
import wrapEvent from "../utils/wrapEvent";
import { exchanges } from "../../context";
import { addExchangeParams } from "../../services/Exchanges";
import { encrypt } from "../../utils/crypt";

export default (context: { socket: Socket; db: Db }) => {
  wrapEvent(
    "getExchange",
    async (_, ctx) => {
      ctx.emit(await ctx.db.collection("exchange").find({}).toArray());
    },
    context
  );
  wrapEvent(
    "removeExchange",
    async (id, ctx) => {
      const exchangeCollection = ctx.db.collection("exchange");
      await exchangeCollection.deleteOne({ _id: new ObjectId(id) });
      ctx.emit(true);
      ctx.socket.emit(
        "getExchange:response",
        await ctx.db.collection("exchange").find({}).toArray()
      );
    },
    context
  );

  wrapEvent(
    "addExchange",
    async (msg, ctx) => {
      const exchangeCollection = ctx.db.collection("exchange");
      const { ops } = await exchangeCollection.insertOne({
        ...msg,
        secretKey: encrypt(msg.secretKey),
        publicKey: encrypt(msg.publicKey),
      });
      await exchanges.addExchange(msg as unknown as addExchangeParams);
      ctx.emit(ops);
      ctx.socket.emit(
        "getExchange:response",
        await ctx.db.collection("exchange").find({}).toArray()
      );
    },
    context
  );
};

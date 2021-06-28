import { Db } from "mongodb";
import { Socket } from "socket.io";
import wrapEvent from "../utils/wrapEvent";

export default (context: { socket: Socket; db: Db }) => {
  wrapEvent(
    "isInit",
    (_, ctx) => {
      ctx.emit(false);
    },
    context
  );

  wrapEvent(
    "hasInit1",
    async (_, ctx) => {
      const countDocuments = await ctx.db
        .collection("exchange")
        .countDocuments();
      ctx.emit(countDocuments > 0);
    },
    context
  );

  wrapEvent(
    "hasInit2",
    async (_, ctx) => {
      const countDocuments = await ctx.db
        .collection("exchange")
        .countDocuments({ balance: { $exists: true } });
      ctx.emit(countDocuments > 0);
    },
    context
  );

  wrapEvent(
    "hasInit3",
    async (_, ctx) => {
      const countDocuments = await ctx.db
        .collection("position")
        .countDocuments({});
      ctx.emit(countDocuments > 0);
    },
    context
  );
};

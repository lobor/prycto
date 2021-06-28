import { Db, ObjectId } from "mongodb";
import { Socket } from "socket.io";
import { Order } from "ccxt";

import wrapEvent from "../utils/wrapEvent";
import { exchanges } from "../../context";
import { flatten } from "lodash";
import {
  AddPositionParams,
  RemovePositionParams,
  EditPositionParams,
} from "../../../type";

const getPositions = async (ctx: { socket: Socket; db: Db }) => {
  const positions = await ctx.db.collection("position").find({}).toArray();
  return flatten(
    await Promise.all(
      positions.map(async (position) => {
        const { pair, exchangeId } = position;
        const [asset1] = pair.split("/");
        const exchange = await ctx.db.collection("exchange").findOne({
          _id: new ObjectId(exchangeId),
        });
        if (exchange) {
          return {
            ...position,
            ...exchange.balance[asset1],
            exchange: exchange.exchange,
          };
        }
      })
    )
  );
};

export default (context: { socket: Socket; db: Db }) => {
  wrapEvent(
    "createPositions",
    async (
      positions: { exchangeId: string; pairs: string[] },
      { db, emit }
    ) => {
      const positionsInvestment: any[] = [];
      const histories = await exchanges.getHistoryByExchangeId(positions);
      positions.pairs.forEach((position: string) => {
        const historiesOnPosition = histories.filter(
          ({ symbol }) => symbol === position
        );
        const positionTmp = {
          pair: position,
          investment: 0,
        };
        let investment = 0;
        historiesOnPosition.forEach((order) => {
          if (order.status === "closed") {
            if (order.side === "buy") {
              investment += Number(order.cost);
            }
            if (order.side === "sell") {
              investment -= Number(order.cost);
            }
          }
        });
        positionTmp.investment = investment < 0 ? 0 : investment;
        positionsInvestment.push({
          ...positionTmp,
          exchangeId: positions.exchangeId,
        });
      });
      await db.collection("position").insertMany(positionsInvestment);
      emit(positionsInvestment);
    },
    context
  );

  wrapEvent(
    "syncPositions",
    async (
      positions: { _id: string; pair: string; exchangeId: string },
      ctx
    ) => {
      const { db, emit, error, socket } = ctx;
      const exchange = await db
        .collection("exchange")
        .findOne({ _id: new ObjectId(positions.exchangeId) });
      if (!exchange) {
        error(404, `exchange not found`);
        return;
      }
      const historiesBdd = await db
        .collection("position")
        .find({ symbol: positions.pair })
        .toArray();
      const historiesBddOrderIds = historiesBdd.map(({ id }) => id);
      const [histories, balances] = await Promise.all([
        exchanges.getHistoryByExchangeId({
          exchangeId: positions.exchangeId,
          pairs: [positions.pair],
        }),
        exchanges.getBalances([{ _id: positions.exchangeId }]),
      ]);
      const historiesOnPosition = histories.filter(
        ({ symbol }) => symbol === positions.pair
      );
      const historyToInsert: any[] = [];
      historiesOnPosition.forEach((order) => {
        if (!historiesBddOrderIds.includes(order.id)) {
          historyToInsert.push({ ...order, exchangeId: positions.exchangeId });
        }
      });
      if (historyToInsert.length > 0) {
        await db.collection("history").insertMany(historyToInsert);
      }
      let investment = 0;
      historiesOnPosition.forEach((order) => {
        if (order.status === "closed") {
          if (order.side === "buy") {
            investment += Number(order.cost);
          }
          if (order.side === "sell") {
            investment -= Number(order.cost);
          }
        }
      });
      const balance = balances[positions.exchangeId];

      Object.keys(exchange.balance).forEach((position) => {
        if (balance[position]) {
          exchange.balance[position].available = balance[position];
        }
      });

      await Promise.all([
        db
          .collection("position")
          .updateOne(
            { _id: new ObjectId(positions._id) },
            { $set: { investment } }
          ),
        db
          .collection("exchange")
          .updateOne(
            { _id: new ObjectId(positions.exchangeId) },
            { $set: { balance: exchange.balance } }
          ),
      ]);
      emit(true);
      socket.emit("getPositions:response", await getPositions(ctx));
    },
    context
  );

  wrapEvent(
    "getPositions",
    async (_, ctx) => {
      ctx.emit(await getPositions(ctx));
    },
    context
  );

  wrapEvent(
    "addPosition",
    async ({ exchangeId, symbol }: AddPositionParams, ctx) => {
      const position = await ctx.db
        .collection("position")
        .findOne({ exchangeId: exchangeId, pair: symbol });
      if (position) {
        ctx.error(406, "position already exists");
        return;
      }

      const positionsInvestment: any[] = [];
      const histories = await exchanges.getHistoryByExchangeId({
        exchangeId,
        pairs: [symbol],
      });
      [symbol].forEach((position: string) => {
        const historiesOnPosition = histories.filter(
          ({ symbol }) => symbol === position
        );
        const positionTmp = {
          pair: position,
          investment: 0,
          available: 0,
        };
        let investment = 0;
        historiesOnPosition.forEach((order) => {
          if (order.status === "closed") {
            if (order.side === "buy") {
              investment += Number(order.cost);
            }
            if (order.side === "sell") {
              investment -= Number(order.cost);
            }
          }
        });
        positionTmp.investment = investment < 0 ? 0 : investment;
        positionsInvestment.push({ ...positionTmp, exchangeId });
      });
      await ctx.db.collection("position").insertMany(positionsInvestment);
      ctx.emit(positionsInvestment);
      ctx.socket.emit("getPositions:response", await getPositions(ctx));
    },
    context
  );

  wrapEvent(
    "removePosition",
    async (id: RemovePositionParams, ctx) => {
      const position = await ctx.db
        .collection("position")
        .findOne({ _id: new ObjectId(id) });
      if (!position) {
        ctx.error(404, "position not found");
        return;
      }
      await ctx.db.collection("position").deleteOne({ _id: new ObjectId(id) });
      ctx.emit(true);
      ctx.socket.emit("getPositions:response", await getPositions(ctx));
    },
    context
  );

  wrapEvent(
    "editPosition",
    async ({ positionId, objectif }: EditPositionParams, ctx) => {
      const collection = ctx.db.collection("position");
      const position = await collection.findOne({
        _id: new ObjectId(positionId),
      });
      if (!position) {
        ctx.error(404, "position not found");
        return;
      }
      await collection.updateOne(
        { _id: new ObjectId(positionId) },
        { $set: { objectif: Number(objectif) } }
      );
      ctx.emit(true);
      ctx.socket.emit("getPositions:response", await getPositions(ctx));
    },
    context
  );
};

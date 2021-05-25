import express from "express";
import { Express, Request, Response } from "express";
import * as http from "http";
import { parse } from "url";
import { flatten } from "lodash";
import next, { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import * as socketio from "socket.io";
import { AssetBalance, QueryOrderResult } from "binance-client";
import binance from "./services/Binance";
import { clientRest as ftxRest } from "./services/Ftx";
import config from "./config";
import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const port: number = parseInt(process.env.PORT || "3000", 10);
const dev: boolean = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

const app: Express = express();
const server: http.Server = http.createServer(app);
const io: socketio.Server = new socketio.Server(server, {
  serveClient: false,
  allowEIO3: true,
});

const pairs: Record<string, string[]> = { binance: [], ftx: [] };

const balances: Record<string, AssetBalance[]> = { binance: [], ftx: [] };

const getHistoryOrder = async () => {
  await Promise.all(
    pairs.binance.map(async (pair) => {
      const orders = await binance.allOrders({ symbol: pair });
      await writeFile(`./.tmp/binance_${pair}.json`, JSON.stringify(orders));
    })
  );

  if (ftxRest) {
    await Promise.all(
      pairs.ftx.map(async (pair) => {
        const ordersFtx = await ftxRest.getOrderHistory({ market: pair });
        await writeFile(
          `./.tmp/ftx_${pair.replace('/', '_')}.json`,
          JSON.stringify(ordersFtx.result)
        );
      })
    );
  }
};

const getPositions = async () => {
  const historyOrder: QueryOrderResult[] = flatten(
    await Promise.all([
      ...pairs.binance.map(async (pair) => {
        return JSON.parse(
          (await readFile(`./.tmp/binance_${pair}.json`)).toString()
        );
      }),
      ...pairs.ftx.map(async (pair) => {
        return JSON.parse(
          (await readFile(`./.tmp/ftx_${pair.replace('/', '_')}.json`)).toString()
        );
      }),
    ])
  );

  const historyOrderByPair = historyOrder.reduce<
    Record<string, QueryOrderResult[]>
  >((acc, order) => {
    const key = order.symbol || order.market;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(order);
    return acc;
  }, {});

  const positions: { pair: string; investment: number; available: number }[] =
    [];
  await Promise.all(
    pairs.binance.map(async (pairConfig) => {
      const goodPair = Object.keys(historyOrderByPair).find((pair) => {
        return pairConfig === pair;
      });
      if (goodPair) {
        const balance = balances.binance.find((balance) => {
          return new RegExp(`^${balance.asset}`).exec(goodPair);
        });
        let investment = 0;
        const orders = historyOrderByPair[goodPair];
        orders.forEach((order) => {
          if (order.status === "FILLED") {
            if (order.side === "BUY") {
              investment += Number(order.cummulativeQuoteQty);
            }
            if (order.side === "SELL") {
              investment -= Number(order.cummulativeQuoteQty);
            }
          }
        });
        positions.push({
          pair: goodPair,
          investment: investment < 0 ? 0 : investment,
          available: (balance && Number(balance.free)) || 0,
        });
      }
    })
  );
  await Promise.all(
    pairs.ftx.map(async (pairConfig) => {
      const goodPair = Object.keys(historyOrderByPair).find((pair) => {
        return pairConfig === pair.replace('-', '/');
      });
      if (goodPair) {
        const balance = balances.ftx.find((balance) => {
          return new RegExp(`^${balance.coin}`).exec(goodPair);
        });
        let investment = 0;
        const orders = historyOrderByPair[goodPair];
        orders.forEach((order) => {
          if (order.status === "closed") {
            if (order.side === "buy") {
              investment += Number(order.avgFillPrice);
            }
            if (order.side === "sell") {
              investment -= Number(order.avgFillPrice);
            }
          }
        });
        positions.push({
          pair: goodPair,
          investment: investment < 0 ? 0 : investment,
          available: (balance && Number(balance.free)) || 0,
        });
      }
    })
  );
  return { positions, historyOrderByPair };
};

io.on("connection", async (socket: socketio.Socket) => {
  console.log("connection");
  socket.on("disconnect", () => {
    console.log("client disconnected");
  });

  socket.on("positions", async () => {
    const { positions } = await getPositions();
    socket.emit("positions", positions);
  });
  const { historyOrderByPair } = await getPositions();
  let cancelTrades = binance.ws.trades(
    Object.keys(historyOrderByPair),
    (trade) => {
      socket.emit("market", { [trade.symbol]: trade.price });
    }
  );

  socket.on("reloadPositions", async () => {
    cancelTrades();
    await getHistoryOrder();
    const { positions, historyOrderByPair } = await getPositions();
    socket.emit("reloadPositions", positions);
    binance.ws.trades(Object.keys(historyOrderByPair), (trade) => {
      socket.emit("market", { [trade.symbol]: trade.price });
    });
  });
});

nextApp.prepare().then(async () => {
  const pairsConfig = config.get("pairs:binance");
  pairs.binance.push(...pairsConfig);
  const user = await binance.accountInfo();

  balances.binance.push(
    ...user.balances.filter(({ free }) => Number(free) > 0)
  );

  if (ftxRest) {
    balances.ftx.push(...(await ftxRest.getBalances()).result);
  }

  const pairsFtx = config.get("pairs:ftx");
  pairs.ftx.push(...pairsFtx);

  await getHistoryOrder();
  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

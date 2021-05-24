import express from "express";
import { Express, Request, Response } from "express";
import * as http from "http";
import { parse } from "url";
import { flatten } from "lodash";
import next, { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import * as socketio from "socket.io";
import { AssetBalance, QueryOrderResult } from "binance-client";
import binance from "./services/Binance";
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

const pairs: string[] = [];

const balances: AssetBalance[] = [];

const getHistoryOrder = async () => {
  await Promise.all(
    pairs.map(async (pair) => {
      const orders = await binance.allOrders({ symbol: pair });
      await writeFile(`./.tmp/${pair}.json`, JSON.stringify(orders));
    })
  );
};

const getPositions = async () => {
  const historyOrder: QueryOrderResult[] = flatten(
    await Promise.all(
      pairs.map(async (pair) => {
        return JSON.parse((await readFile(`./.tmp/${pair}.json`)).toString());
      })
    )
  );

  const historyOrderByPair = historyOrder.reduce<
    Record<string, QueryOrderResult[]>
  >((acc, order) => {
    if (!acc[order.symbol]) {
      acc[order.symbol] = [];
    }
    acc[order.symbol].push(order);
    return acc;
  }, {});

  const positions: { pair: string; investment: number; available: number }[] =
    [];
  await Promise.all(
    pairs.map(async (pairConfig) => {
      const goodPair = Object.keys(historyOrderByPair).find((pair) => {
        return pairConfig === pair;
      });
      if (goodPair) {
        const balance = balances.find((balance) => {
          return new RegExp(`^${balance.asset}`).exec(goodPair);
        });
        // console.log(balance)
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
  return { positions, historyOrderByPair };
};

io.on("connection", async (socket: socketio.Socket) => {
  console.log("connection");
  socket.on("disconnect", () => {
    console.log("client disconnected");
  });


  socket.on("positions", async () => {
    const { positions } = await getPositions()
    socket.emit("positions", positions);
  });
  const { historyOrderByPair } = await getPositions();
  let cancelTrades = binance.ws.trades(Object.keys(historyOrderByPair), (trade) => {
    socket.emit("market", { [trade.symbol]: trade.price });
  });

  socket.on("reloadPositions", async () => {
    cancelTrades();
    await getHistoryOrder();
    const { positions, historyOrderByPair } = await getPositions();
    socket.emit("reloadPositions", positions);
    binance.ws.trades(Object.keys(historyOrderByPair), (trade) => {
      socket.emit("market", { [trade.symbol]: trade.price });
    })
  });

});

nextApp.prepare().then(async () => {
  const { pairs: pairsConfig }: { pairs: string[] } = JSON.parse(
    (await readFile(`./config.json`)).toString()
  );
  pairs.push(...pairsConfig);
  const user = await binance.accountInfo();
  balances.push(...user.balances.filter(({ free }) => Number(free) > 0));

  await getHistoryOrder();
  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

import express from "express";
import { Express } from "express";
import * as http from "http";
import next, { NextApiHandler } from "next";
import * as socketio from "socket.io";
import { RestClient, WebsocketClient } from "ftx-api";
import { DefaultLogger } from "ftx-api/lib/logger";
import BinanceMethod from "binance-api-node";
import Binance from "./interfaces/Binance";
import Ftx from "./interfaces/Ftx";
import config from "./config";
import Exchange from "./services/Exchange";

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

let binance: Binance | undefined;
let ftx: Ftx | undefined;
if (config.get("Api:BINANCE_APIKEY") && config.get("Api:BINANCE_APISECRET")) {
  binance = new Binance(
    BinanceMethod({
      apiKey: config.get("Api:BINANCE_APIKEY"),
      apiSecret: config.get("Api:BINANCE_APISECRET"),
    })
  );
}

if (config.get("Api:FTX_APIKEY") && config.get("Api:FTX_APISECRET")) {
  ftx = new Ftx({
    ws: new WebsocketClient(
      {
        key: config.get("Api:FTX_APIKEY"),
        secret: config.get("Api:FTX_APISECRET"),
      },
      // { error: () => {}, info: () => {}, warning: () => {} } as typeof DefaultLogger
    ),
    rest: new RestClient(
      config.get("Api:FTX_APIKEY"),
      config.get("Api:FTX_APISECRET")
    ),
  });
}

const exchange = new Exchange({ binance, ftx });
// const exchange = new Exchange({ binance, ftx });

io.on("connection", async (socket: socketio.Socket) => {
  console.log("connection");

  socket.on("disconnect", () => {
    console.log("client disconnected");
    exchange.unsubscribe();
  });

  socket.on("positions", async (msg) => {
    socket.emit("positions", await exchange.getPositions());
  });

  exchange.getMarkets((params) => {
    socket.emit("markets", params);
  });

  socket.on("getAllPairs", async (msg) => {
    socket.emit("getAllPairs", await exchange.getAllPairs());
  });

  socket.on("addPosition", async (msg) => {
    try  {
      await exchange.addPosition(msg.exchange, msg.pair);
    } catch (e) {
      console.log(e)
      socket.emit("error", e.toString());
    }
    socket.emit("positions", await exchange.getPositions());
    exchange.unsubscribe();
    exchange.getMarkets((params) => {
      socket.emit("markets", params);
    });
  });

  socket.on("removePosition", async (msg) => {
    const pairsExchange = config.get(`pairs:${msg.exchange}`);
    config.set(
      `pairs:${msg.exchange}`,
      pairsExchange.filter((pair: string) => pair !== msg.pair)
    );
    config.save(async (err: Error | undefined) => {
      if (!err) {
        socket.emit("positions", await exchange.getPositions());
        exchange.unsubscribe();
        exchange.getMarkets((params) => {
          socket.emit("markets", params);
        });
      }
    });
  });
});

nextApp.prepare().then(async () => {
  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

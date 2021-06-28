import express from "express";
import { Express } from "express";
import * as http from "http";
import next, { NextApiHandler } from "next";
import * as socketio from "socket.io";
import { MongoClient } from "mongodb";
import { exchanges } from "./context";
import routeSocket from "./api/socket";
import { decrypt } from "./utils/crypt";
// @ts-ignore
import ccxws from "ccxws";

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

// Database Name
const dbName = "prycto";
const client = new MongoClient("mongodb://mongo-prycto:27017", {
  useUnifiedTopology: true,
});
// Use connect method to connect to the server
client.connect(async function (error?: Error) {
  if (error) {
    console.error(error.toString());
    process.exit();
  }
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  const exchangesBdd = await db.collection("exchange").find({}).toArray();
  exchangesBdd.forEach((exchange) => {
    exchanges.addExchange({
      ...exchange,
      secretKey: decrypt(exchange.secretKey),
      publicKey: decrypt(exchange.publicKey),
    });
  });

  await exchanges.loadMarkets();

  io.on("connection", async (socket: socketio.Socket) => {
    console.log(`Client connection`);

    const binance = new ccxws.Binance();

    const positions = await db.collection("position").find({}).toArray();
    socket.on("disconnect", () => {
      positions.forEach((position) => {
        const [base, quote] = position.pair.split("/");
        binance.unsubscribeTrades({
          id: position.pair.replace("/", ""),
          base,
          quote,
        });
      });
      console.log("client disconnected");
    });

    positions.forEach((position) => {
      const [base, quote] = position.pair.split("/");
      binance.subscribeTrades({
        id: position.pair.replace("/", ""),
        base,
        quote,
      });
    });
    binance.on("trade", (trade: any) => {
      socket.emit(`getMarkets:response`, {
        [`${trade.base}/${trade.quote}`]: Number(trade.price),
      });
      socket.emit(`getMarkets:${trade.base}/${trade.quote}:response`, {
        [`${trade.base}/${trade.quote}`]: Number(trade.price),
      });
    });

    routeSocket({ socket, db });
  });

  nextApp.prepare().then(async () => {
    app.all("*", (req: any, res: any) => nextHandler(req, res));

    server.listen(port, async () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  });

  process.on("exit", () => {
    if (client) {
      client.close();
    }
  });
});

import express from "express";
import { Express } from "express";
import * as http from "http";
import next, { NextApiHandler } from "next";
import * as socketio from "socket.io";
import { MongoClient, ObjectId } from "mongodb";
import { RestClient, WebsocketClient } from "ftx-api";
import { DefaultLogger } from "ftx-api/lib/logger";
import BinanceMethod from "binance-api-node";
import Binance from "./interfaces/Binance";
import Ftx from "./interfaces/Ftx";
import config from "./config";
import Exchange from "./services/Exchange";
import CryptoJS from "crypto-js";
import BinanceOther from 'node-binance-api'

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

const secret = "secret key 123";
const encrypt = (msg: string) => {
  return CryptoJS.AES.encrypt(msg, secret).toString();
};

const decrypt = (ciphertext: string) => {
  var bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Database Name
const dbName = "prycto";
const client = new MongoClient("mongodb://mongo-prycto:27017", { useUnifiedTopology: true });
// Use connect method to connect to the server
client.connect(async function (error?: Error) {
  if (error) {
    console.error(error.toString());
    process.exit();
  }
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  let binance: Binance | undefined;
  let ftx: Ftx | undefined;
  const exchanges = await db.collection('exchange').findOne({ exchange: 'binance' });
  if (exchanges) {
    const binanceOther = new BinanceOther().options({
      APIKEY: decrypt(exchanges.publicKey),
      APISECRET: decrypt(exchanges.secretKey)
    });

    // start ETH/BETH
    // const infos = await binanceOther.promiseRequest('v1/bswap/liquidity', {}, { base:'https://api.binance.com/sapi/', type:'SIGNED' })
    // infos.forEach((info) => {
    //   if (Number(info.share.shareAmount) > 0) {
    //     console.log(info)
    //   }
    // })
    // end ETH/BETH

    // start ONE
    const infos = await binanceOther.promiseRequest('v1/capital/config/getall', {}, { base:'https://api.binance.com/sapi/', type:'SIGNED' })
    infos.forEach((info) => {
      if (info.coin === 'ONE') {
        console.log(info)
      }
    })
    // console.log(infos)
    // end ONE
    binance = new Binance(
      BinanceMethod({
        apiKey: decrypt(exchanges.publicKey),
        apiSecret: decrypt(exchanges.secretKey),
      }),
      db
    );
  }

  // if (config.get("Api:FTX_APIKEY") && config.get("Api:FTX_APISECRET")) {
  //   ftx = new Ftx({
  //     ws: new WebsocketClient(
  //       {
  //         key: config.get("Api:FTX_APIKEY"),
  //         secret: config.get("Api:FTX_APISECRET"),
  //       }
  //       // { error: () => {}, info: () => {}, warning: () => {} } as typeof DefaultLogger
  //     ),
  //     rest: new RestClient(
  //       config.get("Api:FTX_APIKEY"),
  //       config.get("Api:FTX_APISECRET")
  //     ),
  //   });
  // }

  const exchange = new Exchange({ binance, ftx });
  // const exchange = new Exchange({ binance, ftx });

  io.on("connection", async (socket: socketio.Socket) => {
    console.log("connection");

    socket.on("disconnect", () => {
      console.log("client disconnected");
      exchange.unsubscribe();
    });

    socket.on("addExchange:request", async (msg) => {
      const exchangeCollection = db.collection("exchange");
      const { ops } = await exchangeCollection.insertOne({
        ...msg,
        secretKey: encrypt(msg.secretKey),
        publicKey: encrypt(msg.publicKey),
      });
      socket.emit("addExchange:response", ops);
    });

    socket.on('editPosition', async ({ _id, locked, available }) => {
      const collection = db.collection("position");
      await collection.updateOne({ _id: new ObjectId(_id) }, { $set: { locked, available } })
      socket.emit("positions:response", await exchange.getPositions());
    })

    socket.on("getExchange:request", async (msg) => {
      const exchangeCollection = db.collection("exchange");
      socket.emit(
        "getExchange:response",
        await exchangeCollection.find({}).toArray()
      );
    });

    socket.on("removeExchange:request", async (msg) => {
      const exchangeCollection = db.collection("exchange");
      exchangeCollection.deleteOne({ _id: new ObjectId(msg) });
    });

    socket.on("positions:request", async (msg) => {
      socket.emit("positions:response", await exchange.getPositions());
    });

    exchange.getMarkets((params) => {
      socket.emit("markets:response", params);
    });

    socket.on("getAllPairs", async (msg) => {
      socket.emit("getAllPairs", await exchange.getAllPairs());
    });

    socket.on("getHistoryPrice", async (msg) => {
      socket.emit("getHistoryPrice", await exchange.getHistoricalPrice());
    });

    socket.on("addPosition", async (msg) => {
      try {
        await exchange.addPosition(msg.exchange, msg.pair);
      } catch (e) {
        console.log(e);
        socket.emit("error", e.toString());
      }
      socket.emit("positions:response", await exchange.getPositions());
      exchange.unsubscribe();
      exchange.getMarkets((params) => {
        socket.emit("markets:response", params);
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
          socket.emit("positions:response", await exchange.getPositions());
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

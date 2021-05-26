import { RestClient, WebsocketClient } from "ftx-api";
import config from "../config";

let ws: WebsocketClient | false = false;
let clientRest: RestClient | false = false;

if (config.get("Api:FTX_APIKEY") && config.get("Api:FTX_APISECRET")) {
  ws = new WebsocketClient({
    key: config.get("Api:FTX_APIKEY"),
    secret: config.get("Api:FTX_APISECRET"),
  });
  clientRest = new RestClient(
    config.get("Api:FTX_APIKEY"),
    config.get("Api:FTX_APISECRET")
  );
}

export { clientRest, ws };

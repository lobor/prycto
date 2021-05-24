import { RestClient } from "ftx-api";
import config from "../config";

const clientRest = new RestClient(
  config.get("Api:FTT_APIKEY"),
  config.get("Api:FTT_APISECRET")
);

export { clientRest };

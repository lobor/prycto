import { RestClient } from "ftx-api";
import config from "../config";

const clientRest =
  (config.get("Api:FTT_APIKEY") &&
    config.get("Api:FTT_APISECRET") &&
    new RestClient(
      config.get("Api:FTT_APIKEY"),
      config.get("Api:FTT_APISECRET")
    )) ||
  false;

export { clientRest };

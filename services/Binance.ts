import Binance, { Binance as BinanceInstance} from 'binance-api-node';
import configJson from '../config';

let binance: BinanceInstance | false = false;

if (configJson.get('Api:BINANCE_APIKEY') && configJson.get('Api:BINANCE_APISECRET')) {
  binance = Binance({
    apiKey: configJson.get('Api:BINANCE_APIKEY'),
    apiSecret: configJson.get('Api:BINANCE_APISECRET'),
  })
}

export default binance;

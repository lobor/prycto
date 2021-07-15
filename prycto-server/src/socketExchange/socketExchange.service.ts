import { Injectable } from '@nestjs/common';
import * as ccxws from 'ccxws';
import { uniq } from 'lodash';
import { AppService } from 'src/app.service';
import { Exchange } from 'src/exchanges/exchange.schema';
import { ExchangeService } from 'src/exchanges/service';
import { PositionsService } from 'src/positions/positions.service';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

const pairsByExchange: Record<string, any> = {};
const exchangeByName: Record<string, any> = {};

@Injectable()
export class SocketExchangeService {
  constructor(
    private readonly appService: AppService,
    private readonly positionsService: PositionsService,
    private readonly exchangeService: ExchangeService,
    private readonly pubSub: PubSubService,
  ) {
    this.init();
  }

  private async init() {
    const positions = await this.positionsService.findAll();
    const exchanges = await this.exchangeService.findAll();
    const exchangeByIds = exchanges.reduce<Record<string, 'ftx' | 'binance'>>(
      (acc, { exchange, _id }) => {
        acc[_id] = exchange as 'ftx' | 'binance';
        return acc;
      },
      {},
    );

    exchanges.forEach((exchange) => {
      this.createByExchange(exchange);
    });

    const byExchangeName = positions.reduce<
      Record<'ftx' | 'binance', string[]>
    >(
      (acc, position) => {
        const exchange = exchangeByIds[position.exchangeId];
        if (!acc[exchange]) {
          acc[exchange] = [];
        }
        acc[exchange].push(position.pair);
        return acc;
      },
      { ftx: [], binance: [] },
    );
    Object.keys(byExchangeName).map((keyExchange: 'ftx' | 'binance') => {
      const unique = uniq(byExchangeName[keyExchange]);
      this.subscribeByExchange(keyExchange, unique);
    });
  }

  setPairExchange(exchange: string, pair: string) {
    if (!pairsByExchange[exchange]) {
      pairsByExchange[exchange] = [];
    }
    pairsByExchange[exchange].push(pair);
  }

  async subscribeByExchange(exchange: 'ftx' | 'binance', symbols: string[]) {
    if (exchangeByName[exchange]) {
      symbols.map((symbol) => {
        if (
          pairsByExchange[exchange] &&
          !pairsByExchange[exchange].includes(symbol)
        ) {
          this.setPairExchange(exchange, symbol);
          const [base, quote] = symbol.split('/');
          exchangeByName[exchange].subscribeTrades({
            id: exchange === 'binance' ? symbol.replace('/', '') : symbol,
            base,
            quote,
            type: 'spot',
          });
        }
      });
    }
  }

  async createByExchange(exchange: Exchange) {
    const { exchange: name } = exchange;
    if (!exchangeByName[name]) {
      exchangeByName[name] = new ccxws[
        name.charAt(0).toUpperCase() + name.slice(1)
      ]({
        apiKey: this.appService.decrypt(exchange.publicKey),
        apiSecret: this.appService.decrypt(exchange.secretKey),
      });
      pairsByExchange[name] = [];
      exchangeByName[name].on('trade', this.event(name));
      exchangeByName[name].on('error', (e) => {
        console.log('error', name, e.toString());
      });
    }
  }

  async unsubscribeTradeByExchangeId(exchangeId: string) {
    const exchange = await this.exchangeService.findById(exchangeId);
    if (exchange && exchangeByName[exchange.exchange]) {
      pairsByExchange[exchange.exchange] = [];
      exchangeByName[exchange.exchange].off('trade', this.event(exchange));
      const positions = await this.positionsService.findByExchangeId(
        exchangeId,
      );
      positions.forEach((position) => {
        const [base, quote] = position.pair.split('/');
        exchangeByName[exchange.exchange].unsubscribeTrades({
          id: position.pair.replace('/', ''),
          base,
          quote,
        });
      });
      if (exchangeByName[exchange.exchange].connected) {
        exchangeByName[exchange.exchange].close();
      }
      exchangeByName[exchange.exchange] = undefined;
    }
  }
  async subscribeTradeByExchangeId(exchangeId: string) {
    const exchange = await this.exchangeService.findById(exchangeId);
    if (exchange && !exchangeByName[exchange.exchange]) {
      const { exchange: name } = exchange;
      if (ccxws[name.charAt(0).toUpperCase() + name.slice(1)]) {
        exchangeByName[exchange.exchange] = new ccxws[
          name.charAt(0).toUpperCase() + name.slice(1)
        ]();
        exchangeByName[exchange.exchange].on('trade', async (trade: any) => {
          if (exchange === 'kraken') {
            console.log(exchange);
          }
          await this.pubSub.publish('marketHit', {
            exchange,
            pair: {
              [`${trade.base}/${trade.quote}`]: Number(trade.price),
            },
          });
        });
        exchangeByName[exchange.exchange].on('error', (e) => {
          console.log('error', name, e.toString());
        });
        const positions = await this.positionsService.findByExchangeId(
          exchangeId,
        );
        positions.forEach((position) => {
          const [base, quote] = position.pair.split('/');
          exchangeByName[exchange.exchange].subscribeTrades({
            id: position.pair.replace('/', ''),
            base,
            quote,
          });
        });
      }
    }
  }

  private event(exchange) {
    return async (trade: any) => {
      if (exchange === 'kraken') {
        console.log(exchange);
      }
      await this.pubSub.publish('marketHit', {
        exchange,
        pair: {
          [`${trade.base}/${trade.quote}`]: Number(trade.price),
        },
      });
    };
  }
}

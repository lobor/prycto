import { Injectable } from '@nestjs/common';
import * as ccxws from 'ccxws';
import { PositionsService } from 'src/positions/positions.service';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Injectable()
export class SocketBinanceService {
  private binance: ccxws.Binance;
  constructor(
    private readonly positionsService: PositionsService,
    private readonly pubSub: PubSubService,
  ) {
    this.binance = new ccxws.Binance();
    this.positionsService.findAll().then((positions) => {
      positions.forEach((position) => {
        const [base, quote] = position.pair.split('/');
        this.binance.subscribeTrades({
          id: position.pair.replace('/', ''),
          base,
          quote,
        });
      });
      this.binance.on('trade', async (trade: any) => {
        await this.pubSub.publish('marketHit', {
          [`${trade.base}/${trade.quote}`]: Number(trade.price),
        });
      });
    });
  }
}

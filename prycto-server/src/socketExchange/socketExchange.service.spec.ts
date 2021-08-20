import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { PositionsService } from '../positions/positions.service';
import { Position } from '../positions/positions.schema';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from './socketExchange.service';
import { Exchange } from '../exchanges/exchange.schema';

describe('SocketExchangeService', () => {
  let service: SocketExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketExchangeService,
        AppService,
        PositionsService,
        ExchangeService,
        PubSubService,
        {
          provide: getModelToken(Position.name),
          useValue: {},
        },
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SocketExchangeService>(SocketExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

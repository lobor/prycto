import { Test, TestingModule } from '@nestjs/testing';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { Position } from '../positions/positions.schema';
import { PositionsService } from '../positions/positions.service';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { Exchange } from '../exchanges/exchange.schema';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('MarketsResolver', () => {
  let resolver: MarketsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        ExchangeService,
        PositionsService,
        MarketsService,
        MarketsResolver,
        PubSubService,
        SocketExchangeService,
        UserService,
        {
          provide: getModelToken(Position.name),
          useValue: {},
        },
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<MarketsResolver>(MarketsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

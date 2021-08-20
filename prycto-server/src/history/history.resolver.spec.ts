import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { Exchange } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { Position } from '../positions/positions.schema';
import { PositionsService } from '../positions/positions.service';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { HistoryResolver } from './history.resolver';
import { History } from './history.schema';
import { HistoryService } from './history.service';

describe('HistoryResolver', () => {
  let resolver: HistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        HistoryResolver,
        AppService,
        ExchangeService,
        UserService,
        PositionsService,
        {
          provide: getModelToken(History.name),
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
        {
          provide: getModelToken(Position.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<HistoryResolver>(HistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

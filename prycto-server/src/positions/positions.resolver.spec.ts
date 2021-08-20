import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../user/user.schema';
import { AppService } from '../app.service';
import { CoursService } from '../cours/cours.service';
import { Exchange } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { PredictService } from '../predict/predict.service';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { SocketExchangeService } from '../socketExchange/socketExchange.service';
import { UserService } from '../user/user.service';
import { PositionsResolver } from './positions.resolver';
import { Position } from './positions.schema';
import { PositionsService } from './positions.service';
import { Predict } from '../predict/predict.schema';
import { Cours } from '../cours/cours.schema';

describe('PositionsResolver', () => {
  let resolver: PositionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        ExchangeService,
        PositionsResolver,
        AppService,
        SocketExchangeService,
        PubSubService,
        UserService,
        PredictService,
        CoursService,
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
        {
          provide: getModelToken(Position.name),
          useValue: {},
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: getModelToken(Predict.name),
          useValue: {},
        },
        {
          provide: getModelToken(Cours.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PositionsResolver>(PositionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PredictService } from './predict.service';
import { AppService } from '../app.service';
import { Cours } from '../cours/cours.schema';
import { CoursService } from '../cours/cours.service';
import { ExchangeService } from '../exchanges/service';
import { PredictResolver } from './predict.resolver';
import { PositionsService } from '../positions/positions.service';
import { Position } from '../positions/positions.schema';
import { Predict } from './predict.schema';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Exchange } from 'ccxt';

describe('PredictService', () => {
  let service: PredictService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictResolver,
        PredictService,
        CoursService,
        AppService,
        ExchangeService,
        PositionsService,
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

    service = module.get<PredictService>(PredictService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

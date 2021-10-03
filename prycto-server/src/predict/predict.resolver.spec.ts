import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { Cours } from '../cours/cours.schema';
import { CoursService } from '../cours/cours.service';
import { Exchange } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { PredictResolver } from './predict.resolver';
import { PredictService } from './predict.service';
import { PositionsService } from '../positions/positions.service';
import { Position } from '../positions/positions.schema';
import { Predict } from './predict.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('PredictResolver', () => {
  let resolver: PredictResolver;

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
          provide: getModelToken(Cours.name),
          useValue: {},
        },
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
        {
          provide: getModelToken(Position.name),
          useValue: {},
        },
        {
          provide: getModelToken(Predict.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PredictResolver>(PredictResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

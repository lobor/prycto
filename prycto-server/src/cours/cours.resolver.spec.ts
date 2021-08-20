import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { Exchange } from '../exchanges/exchange.schema';
import { CoursResolver } from './cours.resolver';
import { CoursService } from './cours.service';
import { getModelToken } from '@nestjs/mongoose';
import { Position } from '../positions/positions.schema';
import { Cours } from './cours.schema';

describe('CoursResolver', () => {
  let resolver: CoursResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursService,
        CoursResolver,
        ExchangeService,
        AppService,
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
        {
          provide: getModelToken(Cours.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CoursResolver>(CoursResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

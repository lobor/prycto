import { Test, TestingModule } from '@nestjs/testing';
import { PairsResolver } from './pairs.resolver';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { Exchange } from '../exchanges/exchange.schema';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PairsResolver', () => {
  let resolver: PairsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PairsResolver,
        AppService,
        ExchangeService,
        UserService,
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        }
      ],
    }).compile();

    resolver = module.get<PairsResolver>(PairsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

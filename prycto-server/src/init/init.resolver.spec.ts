import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Exchange } from '../exchanges/exchange.schema';
import { ExchangeService } from '../exchanges/service';
import { InitResolver } from './init.resolver';

describe('InitResolver', () => {
  let resolver: InitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitResolver,
        ExchangeService,
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<InitResolver>(InitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MarketsResolver } from './markets.resolver';

describe('MarketsResolver', () => {
  let resolver: MarketsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketsResolver],
    }).compile();

    resolver = module.get<MarketsResolver>(MarketsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

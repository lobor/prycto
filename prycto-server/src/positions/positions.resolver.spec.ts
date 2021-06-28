import { Test, TestingModule } from '@nestjs/testing';
import { PositionsResolver } from './positions.resolver';

describe('PositionsResolver', () => {
  let resolver: PositionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionsResolver],
    }).compile();

    resolver = module.get<PositionsResolver>(PositionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

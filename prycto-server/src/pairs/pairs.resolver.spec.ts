import { Test, TestingModule } from '@nestjs/testing';
import { PairsResolver } from './pairs.resolver';

describe('PairsResolver', () => {
  let resolver: PairsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PairsResolver],
    }).compile();

    resolver = module.get<PairsResolver>(PairsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

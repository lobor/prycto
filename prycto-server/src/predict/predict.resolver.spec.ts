import { Test, TestingModule } from '@nestjs/testing';
import { PredictResolver } from './predict.resolver';

describe('PredictResolver', () => {
  let resolver: PredictResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PredictResolver],
    }).compile();

    resolver = module.get<PredictResolver>(PredictResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

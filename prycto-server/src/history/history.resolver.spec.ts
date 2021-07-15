import { Test, TestingModule } from '@nestjs/testing';
import { HistoryResolver } from './history.resolver';

describe('HistoryResolver', () => {
  let resolver: HistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryResolver],
    }).compile();

    resolver = module.get<HistoryResolver>(HistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

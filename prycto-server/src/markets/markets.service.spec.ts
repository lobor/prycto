import { Test, TestingModule } from '@nestjs/testing';
import { MarketsService } from './markets.service';

describe('MarketsService', () => {
  let service: MarketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketsService],
    }).compile();

    service = module.get<MarketsService>(MarketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

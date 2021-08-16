import { Test, TestingModule } from '@nestjs/testing';
import { PredictService } from './predict.service';

describe('PredictService', () => {
  let service: PredictService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PredictService],
    }).compile();

    service = module.get<PredictService>(PredictService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

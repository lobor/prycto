import { Test, TestingModule } from '@nestjs/testing';
import { SocketBinanceService } from './socket-binance.service';

describe('SocketBinanceService', () => {
  let service: SocketBinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketBinanceService],
    }).compile();

    service = module.get<SocketBinanceService>(SocketBinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

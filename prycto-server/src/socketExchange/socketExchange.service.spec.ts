import { Test, TestingModule } from '@nestjs/testing';
import { SocketExchangeService } from './socketExchange.service';

describe('SocketExchangeService', () => {
  let service: SocketExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketExchangeService],
    }).compile();

    service = module.get<SocketExchangeService>(SocketExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

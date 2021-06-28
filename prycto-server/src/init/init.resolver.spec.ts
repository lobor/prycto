import { Test, TestingModule } from '@nestjs/testing';
import { InitResolver } from './init.resolver';

describe('InitResolver', () => {
  let resolver: InitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitResolver],
    }).compile();

    resolver = module.get<InitResolver>(InitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

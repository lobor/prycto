import { Test, TestingModule } from '@nestjs/testing';
import { CoursResolver } from './cours.resolver';

describe('CoursResolver', () => {
  let resolver: CoursResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursResolver],
    }).compile();

    resolver = module.get<CoursResolver>(CoursResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

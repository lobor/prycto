import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { ExchangeService } from '../exchanges/service';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { Exchange } from '../exchanges/exchange.schema';
import { CoursResolver } from './cours.resolver';
import { Cours } from './cours.schema';
import { CoursService } from './cours.service';
import { getModelToken } from '@nestjs/mongoose';

describe('CoursService', () => {
  let service: CoursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursService,
        CoursResolver,
        ExchangeService,
        AppService,
        UserService,
        {
          provide: getModelToken(Cours.name),
          useValue: {},
        },
        {
          provide: getModelToken(Exchange.name),
          useValue: {},
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CoursService>(CoursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

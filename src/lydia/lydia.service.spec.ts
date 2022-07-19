import { Test, TestingModule } from '@nestjs/testing';
import { LydiaService } from './lydia.service';

describe('LydiaService', () => {
  let service: LydiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LydiaService],
    }).compile();

    service = module.get<LydiaService>(LydiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

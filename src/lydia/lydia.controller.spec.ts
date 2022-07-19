import { Test, TestingModule } from '@nestjs/testing';
import { LydiaController } from './lydia.controller';

describe('LydiaController', () => {
  let controller: LydiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LydiaController],
    }).compile();

    controller = module.get<LydiaController>(LydiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

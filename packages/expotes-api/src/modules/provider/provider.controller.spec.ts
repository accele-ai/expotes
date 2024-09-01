import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';

describe('ProviderController', () => {
  let controller: ProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [ProviderService],
    }).compile();

    controller = module.get<ProviderController>(ProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

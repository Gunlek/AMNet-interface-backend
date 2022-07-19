import { Module } from '@nestjs/common';
import { LydiaService } from './lydia.service';

@Module({
    providers: [LydiaService],
    exports: [LydiaService],
  })
export class LydiaModule {}

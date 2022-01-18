import { Module } from '@nestjs/common';
import { HardwareService } from './hardware.service';

@Module({
  providers: [HardwareService]
})
export class HardwareModule {}

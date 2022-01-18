import { Module } from '@nestjs/common';
import { AccessService } from './access.service';

@Module({
  providers: [AccessService],
})
export class AccessModule {}

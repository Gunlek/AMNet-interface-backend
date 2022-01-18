import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessController } from './access/access.controller';
import { HardwareController } from './hardware/hardware.controller';
import { UserController } from './user/user.controller';
import { SettingsController } from './settings/settings.controller';
import { SettingsModule } from './settings/settings.module';
import { UserModule } from './user/user.module';
import { HardwareModule } from './hardware/hardware.module';
import { AccessModule } from './access/access.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SettingsModule, UserModule, HardwareModule, AccessModule, AuthModule],
  controllers: [
    AccessController,
    HardwareController,
    UserController,
    SettingsController,
  ],
  providers: [AppService],
})
export class AppModule {}

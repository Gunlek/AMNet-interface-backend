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
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LydiaController } from './lydia/lydia.controller';
import { LydiaModule } from './lydia/lydia.module';

@Module({
  imports: [
    AuthModule,
    SettingsModule,
    UserModule,
    HardwareModule,
    AccessModule,
    MailModule,
    ScheduleModule.forRoot(),
    MulterModule.register({
      storage: memoryStorage()
    }),
    LydiaModule
  ],
  controllers: [
    AccessController,
    HardwareController,
    UserController,
    SettingsController,
    MailController,
    LydiaController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    MailService
  ],
})

export class AppModule { }
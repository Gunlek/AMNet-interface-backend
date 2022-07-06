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
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    SettingsModule,
    UserModule,
    HardwareModule,
    AccessModule,
    AuthModule,
    MailModule,
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './src/access/proof',
    })
  ],
  controllers: [
    AccessController,
    HardwareController,
    UserController,
    SettingsController,
    MailController,
  ],
  providers: [AppService, MailService],
})
export class AppModule {}

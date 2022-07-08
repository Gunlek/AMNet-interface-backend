import { Injectable } from '@nestjs/common';
import { Database, RadiusDatabase } from './utils/database';
import { Gadzflix } from './utils/jellyfin';
import { Transporter } from './utils/mail';


@Injectable()
export class AppService {
  static getInstance(): void {
    Database.getInstance();
    RadiusDatabase.getInstance();
    Transporter.getInstance();
    Gadzflix.getConfig();
  }
}

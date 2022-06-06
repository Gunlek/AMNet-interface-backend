import { ApiProperty } from '@nestjs/swagger';

export type Access = {
  access_id: number;
  access_description: string;
  access_mac: string;
  access_proof: string | File;
  access_user: number;
  access_state: string;
};

export class AccessType {
  @ApiProperty({ default: 47 })
  access_id: number;

  @ApiProperty({ default: 'Chromecast' })
  access_description: string;

  @ApiProperty({ default: 'AABBCCDDEEFF' })
  access_mac: string;

  @ApiProperty({ default: 'AABBCCDDEEFF' })
  access_proof: string;

  @ApiProperty({ default: 102 })
  access_user: number;

  @ApiProperty({ default: 'pending' })
  access_state: string;
}

import { ApiProperty } from '@nestjs/swagger';

export type Access = {
  access_id: number;
  access_description: string;
  access_mac: string;
  access_proof: string;
  access_user: number;
  access_state: string;
  user_name?: string;
};

export class AccessType {
  @ApiProperty({ default: 47 })
  access_id: number;

  @ApiProperty({ default: 'Chromecast' })
  access_description: string;

  @ApiProperty({ default: 'AABBCCDDEEFF' })
  access_mac: string;

  @ApiProperty({ default: 'photoProof-4710258.jpeg' })
  access_proof: string;

  @ApiProperty({ default: 102 })
  access_user: number;

  @ApiProperty({ default: 'pending' })
  access_state: string;

  @ApiProperty({ default: 'Pseudo' })
  user_name: string;
}

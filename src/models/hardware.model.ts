import { ApiProperty } from '@nestjs/swagger';

export type Hardware = {
  material_id: number;
  material_description: string;
  material_reason: string;
  material_user: number;
  material_state: string;
  user_name?: string;
};

export class HardwarelType {
  @ApiProperty({ default: 47 })
  material_id: number;

  @ApiProperty({ default: 'Chromecast' })
  material_description: string;

  @ApiProperty({ default: 'to do CAO' })
  material_reason: string;

  @ApiProperty({ default: 102 })
  material_user: number;

  @ApiProperty({ default: 'pending' })
  material_state: string;

  @ApiProperty({ default: 'Pseudo' })
  user_name: string;
}

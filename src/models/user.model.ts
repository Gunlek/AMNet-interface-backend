import { ApiProperty } from '@nestjs/swagger';

export type User = {
  user_id: number;
  user_name: string;
  user_firstname: string;
  user_lastname: string;
  user_email: string;
  user_phone: string;
  user_password: string;
  user_bucque: string;
  user_fams: string;
  user_campus: string;
  user_proms: string;
  user_rank: 'admin' | 'user';
  user_is_gadz: 0 | 1;
  user_pay_status: 0 | 1;
};

export class UserType {
  @ApiProperty({ default: 58 })
  user_id: number;

  @ApiProperty({ default: 'Pseudo' })
  user_name: string;

  @ApiProperty({ default: 'Prénom' })
  user_firstname: string;

  @ApiProperty({ default: 'Nom' })
  user_lastname: string;

  @ApiProperty({ default: 'fabien.aubret@gadz.org' })
  user_email: string;

  @ApiProperty({ default: '0658585858' })
  user_phone: string;

  @ApiProperty({ default: 'md5 encrypted password' })
  user_password: string;

  @ApiProperty({ default: "HardWin's" })
  user_bucque: string;

  @ApiProperty({ default: 58 })
  user_fams: string;

  @ApiProperty({ default: 'li' })
  user_campus: string;

  @ApiProperty({ default: '218' })
  user_proms: string;

  @ApiProperty({ default: 'user' })
  user_rank: 'admin' | 'user';

  @ApiProperty({ default: 0 })
  user_is_gadz: 0 | 1;

  @ApiProperty({ default: 0 })
  user_pay_status: 0 | 1;
}

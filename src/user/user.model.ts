import { ApiProperty } from '@nestjs/swagger';

export class AuthBody {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

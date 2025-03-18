import { ApiProperty } from '@nestjs/swagger';
import { UserArgs } from './users.interfaces';

export class AuthTokenResponse {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}

export class UserDataResponse {
  @ApiProperty()
  username: UserArgs['username'];
  @ApiProperty()
  walletAddress: UserArgs['walletAddress'];
}

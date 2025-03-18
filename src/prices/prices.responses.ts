import { ApiProperty } from '@nestjs/swagger';

export class PriceTokenResponse {
  @ApiProperty()
  value: number;
}

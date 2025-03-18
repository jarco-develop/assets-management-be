import { ApiProperty } from '@nestjs/swagger';

export class OrderTokenResponse {
  @ApiProperty()
  orderId: string;
  @ApiProperty()
  tokenSymbol: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  price: number;
}

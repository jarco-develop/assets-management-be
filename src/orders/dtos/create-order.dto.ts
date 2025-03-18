import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { OrderType } from '../orders.interface';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tokenSymbol: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

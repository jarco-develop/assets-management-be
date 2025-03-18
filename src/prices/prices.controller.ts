import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PriceTokenResponse } from './prices.responses';
import { PricesService } from './prices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('prices')
@ApiTags('Price')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('/symbol/:symbol')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get token price by symbol' })
  @ApiResponse({
    status: 200,
    description: 'Price',
    type: () => PriceTokenResponse,
  })
  async priceBySymbol(
    @Param('symbol') symbol: string,
  ): Promise<PriceTokenResponse> {
    const price = await this.pricesService.getTokenPriceBySymbol(symbol);

    return {
      value: price,
    };
  }

  @Get('/address/:address')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get token price by address' })
  @ApiResponse({
    status: 200,
    description: 'Price',
    type: () => PriceTokenResponse,
  })
  async priceByAddress(
    @Param('address') address: string,
  ): Promise<PriceTokenResponse> {
    const price = await this.pricesService.getTokenPriceByAddress(address);

    return {
      value: price,
    };
  }
}

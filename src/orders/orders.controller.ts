import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderTokenResponse } from './orders.responses';
import { OrdersService } from './orders.service';
import { RequestWithUser } from '../auth/auth.interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Order' })
  @ApiResponse({
    status: 200,
    type: () => OrderTokenResponse,
  })
  async createOrder(
    @Req() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderTokenResponse> {
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({
    status: 200,
    type: () => [OrderTokenResponse],
  })
  async getOrders(@Req() req: RequestWithUser): Promise<OrderTokenResponse[]> {
    return this.ordersService.getAllOrders(req.user.userId);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderTokenResponse } from './orders.responses';

@Injectable()
export class OrdersService {
  constructor(
    @InjectPinoLogger(OrdersService.name)
    protected readonly logger: PinoLogger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
  ) {}

  private parseOrder(order: Order) {
    return {
      orderId: order.id,
      tokenSymbol: order.tokenSymbol,
      amount: order.amount,
      price: order.price,
    };
  }

  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<OrderTokenResponse> {
    const user = await this.usersService.getById(userId);

    const totalOrderCost = dto.amount * dto.price;

    if (dto.type === 'buy') {
      if (user.balance < totalOrderCost) {
        throw new BadRequestException(
          'Insufficient balance to place the order',
        );
      }
      user.balance -= totalOrderCost;
    } else if (dto.type === 'sell') {
      user.balance += totalOrderCost;
    }

    await this.usersService.update(user);

    const order = this.orderRepository.create({ ...dto, user });

    await this.orderRepository.save(order);

    return this.parseOrder(order);
  }

  async getAllOrders(userId: number): Promise<OrderTokenResponse[]> {
    const user = await this.usersService.getById(userId);
    const orders = await this.orderRepository.find({
      where: { user: { id: user.id } },
    });

    return orders.map((order) => this.parseOrder(order));
  }
}

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getLoggerToken } from 'nestjs-pino';
import t from 'tap';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { Order } from './entities/order.entity';
import { OrderType } from './orders.interface';

const mockOrderRepository = {
  create: (order: Partial<Order>): Partial<Order> => order,
  save: async () => Promise.resolve(),
  find: async (): Promise<Partial<Order>[]> => Promise.resolve([]),
};

const mockUsersService = {
  getById: async (id: number) => ({ id, balance: 1000 }),
  update: async () => ({}),
};

t.test('OrdersService', async (t) => {
  let service: OrdersService;

  t.beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getLoggerToken(OrdersService.name),
          useValue: { error: () => {} },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  t.test('createOrder - success (buy)', async (t) => {
    const userId = 1;
    const orderData = {
      type: OrderType.BUY,
      tokenSymbol: 'ETH',
      amount: 2,
      price: 100,
    };

    mockUsersService.getById = async () => ({ id: userId, balance: 1000 });

    const result = await service.createOrder(userId, orderData);
    t.equal(result.tokenSymbol, 'ETH');
    t.equal(result.amount, 2);
    t.equal(result.price, 100);
  });

  t.test('createOrder - insufficient balance (buy)', async (t) => {
    const userId = 1;
    const orderData = {
      type: OrderType.BUY,
      tokenSymbol: 'ETH',
      amount: 10,
      price: 200,
    };

    mockUsersService.getById = async () => ({ id: userId, balance: 1000 });

    await t.rejects(
      () => service.createOrder(userId, orderData),
      new BadRequestException('Insufficient balance to place the order'),
    );
  });

  t.test('createOrder - success (sell)', async (t) => {
    const userId = 1;
    const orderData = {
      type: OrderType.SELL,
      tokenSymbol: 'ETH',
      amount: 1,
      price: 500,
    };

    mockUsersService.getById = async () => ({ id: userId, balance: 1000 });

    const result = await service.createOrder(userId, orderData);

    t.equal(result.tokenSymbol, 'ETH');
    t.equal(result.amount, 1);
    t.equal(result.price, 500);
  });

  t.test('getAllOrders - success', async (t) => {
    const userId = 1;
    mockUsersService.getById = async () => ({ id: userId, balance: 1000 });

    mockOrderRepository.find = async () => [
      { id: '1', tokenSymbol: 'ETH', amount: 2, price: 300 },
      { id: '2', tokenSymbol: 'BTC', amount: 0.5, price: 50000 },
    ];

    const result = await service.getAllOrders(userId);
    t.equal(result.length, 2);
    t.equal(result[0].tokenSymbol, 'ETH');
    t.equal(result[1].tokenSymbol, 'BTC');
  });

  t.end();
});

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import t from 'tap';
import { ALCHEMY_INSTANCE } from './prices.constants';
import { PricesService } from './prices.service';

const mockAlchemy = {
  prices: {
    getTokenPriceBySymbol: () => ({}),
    getTokenPriceByAddress: () => ({}),
  },
};

t.test('PricesService', async (t) => {
  let service: PricesService;

  t.beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricesService,
        {
          provide: getLoggerToken(PricesService.name),
          useValue: { error: () => {} },
        },
        { provide: ALCHEMY_INSTANCE, useValue: mockAlchemy },
      ],
    }).compile();

    service = module.get<PricesService>(PricesService);
  });

  t.test('getTokenPriceBySymbol - success', async (t) => {
    mockAlchemy.prices.getTokenPriceBySymbol = () => ({
      data: [{ prices: [{ currency: 'usd', value: '100.5' }] }],
    });

    const price = await service.getTokenPriceBySymbol('ETH');
    t.equal(price, 100.5);
  });

  t.test('getTokenPriceBySymbol - token not found', async (t) => {
    mockAlchemy.prices.getTokenPriceBySymbol = () => ({ data: [] });

    await t.rejects(
      () => service.getTokenPriceBySymbol('UNKNOWN'),
      new NotFoundException('Token UNKNOWN do not exists'),
    );
  });

  t.test('getTokenPriceBySymbol - currency not found', async (t) => {
    mockAlchemy.prices.getTokenPriceBySymbol = () => ({
      data: [{ prices: [{ currency: 'eur', value: '90.0' }] }],
    });

    await t.rejects(
      () => service.getTokenPriceBySymbol('ETH', 'usd'),
      new NotFoundException('Token ETH do not exists'),
    );
  });

  t.test('getTokenPriceByAddress - success', async (t) => {
    mockAlchemy.prices.getTokenPriceByAddress = () => ({
      data: [{ prices: [{ currency: 'usd', value: '200.75' }] }],
    });

    const price = await service.getTokenPriceByAddress('0x123');
    t.equal(price, 200.75);
  });

  t.test('getTokenPriceByAddress - token not found', async (t) => {
    mockAlchemy.prices.getTokenPriceByAddress = () => ({ data: [] });

    await t.rejects(
      () => service.getTokenPriceByAddress('0x456'),
      new NotFoundException('Token 0x456 do not exists'),
    );
  });

  t.test('getTokenPriceByAddress - currency not found', async (t) => {
    mockAlchemy.prices.getTokenPriceByAddress = () => ({
      data: [{ prices: [{ currency: 'gbp', value: '75.0' }] }],
    });

    await t.rejects(
      () => service.getTokenPriceByAddress('0x789', 'usd'),
      new NotFoundException('Token 0x789 do not exists'),
    );
  });

  t.end();
});

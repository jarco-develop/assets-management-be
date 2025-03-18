import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  Alchemy,
  GetTokenPriceByAddressResponse,
  GetTokenPriceBySymbolResponse,
  Network,
} from 'alchemy-sdk';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ALCHEMY_INSTANCE } from './prices.constants';

@Injectable()
export class PricesService {
  constructor(
    @InjectPinoLogger(PricesService.name)
    protected readonly logger: PinoLogger,
    @Inject(ALCHEMY_INSTANCE)
    private readonly alchemy: Alchemy,
  ) {}

  private parseTokenPrice(
    tokens: GetTokenPriceBySymbolResponse | GetTokenPriceByAddressResponse,
    currency = 'usd',
  ) {
    if (tokens.data.length === 0) {
      throw new Error('Token not found');
    }

    const prices = tokens.data?.[0]?.prices || [];
    const currencyPrice = prices.find(
      (price) => price.currency.toLowerCase() === currency.toLowerCase(),
    );

    if (!currencyPrice) {
      throw new Error('Token price for currency not found');
    }

    return parseFloat(currencyPrice?.value || '0');
  }

  public async getTokenPriceBySymbol(
    symbol: string,
    currency = 'usd',
  ): Promise<number> {
    try {
      const tokens = await this.alchemy.prices.getTokenPriceBySymbol([symbol]);

      return this.parseTokenPrice(tokens, currency);
    } catch (err) {
      this.logger.error({ err, symbol });

      throw new NotFoundException(`Token ${symbol} do not exists`);
    }
  }

  public async getTokenPriceByAddress(
    address: string,
    currency = 'usd',
  ): Promise<number> {
    try {
      const tokens = await this.alchemy.prices.getTokenPriceByAddress([
        {
          network: Network.ETH_MAINNET,
          address,
        },
      ]);

      return this.parseTokenPrice(tokens, currency);
    } catch (err) {
      this.logger.error({ err, address });

      throw new NotFoundException(`Token ${address} do not exists`);
    }
  }
}

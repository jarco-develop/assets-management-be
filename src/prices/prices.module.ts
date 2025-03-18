import { Module } from '@nestjs/common';
import { Alchemy } from 'alchemy-sdk';
import { ALCHEMY_INSTANCE } from './prices.constants';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';

@Module({
  imports: [EnvModule],
  controllers: [PricesController],
  providers: [
    {
      provide: ALCHEMY_INSTANCE,
      inject: [EnvService],
      useFactory: async (env: EnvService) =>
        new Alchemy({ apiKey: env.ALCHEMY_API }),
    },
    PricesService,
  ],
})
export class PricesModule {}

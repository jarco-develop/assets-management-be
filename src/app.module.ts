import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { OrdersModule } from './orders/orders.module';
import { PricesModule } from './prices/prices.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    LoggerModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (env: EnvService) => env.getPinoConfig(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (env: EnvService) => ({
        type: 'postgres',
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DB,
        ssl: env.isProduction(),
        logging: false,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    PricesModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

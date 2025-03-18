import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { Params as PinoParams } from 'nestjs-pino';
import { Level as PinoLevel, LoggerOptions } from 'pino';
import { Environment } from '../env/env.interfaces';

export class EnvironmentVariables {
  @IsEnum(Environment)
  public NODE_ENV: Environment;
  @IsNumber()
  public PORT: number;
  @IsString()
  public API_BASE_PATH: string;
  @IsString()
  public LOG_NAME: string;
  @IsString()
  public LOG_LEVEL: PinoLevel;
  @IsString()
  public POSTGRES_HOST: string;
  @IsString()
  public POSTGRES_DB: string;
  @IsNumber()
  public POSTGRES_PORT: number;
  @IsString()
  public POSTGRES_USER: string;
  @IsString()
  public POSTGRES_PASSWORD: string;
  @IsString()
  public JWT_ACCESS_TOKEN_SECRET: string;
  @IsString()
  public JWT_ACCESS_TOKEN_EXPIRATION_TIME: string;
  @IsString()
  public JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
  @IsString()
  public ALCHEMY_API: string;
}

@Injectable()
export class EnvService extends EnvironmentVariables {
  constructor(private config: ConfigService) {
    super();
    this.NODE_ENV = this.config.get<Environment>(
      'NODE_ENV',
      Environment.Development,
    );
    this.PORT = parseInt(this.config.get<string>('PORT', '8080'), 10);
    this.API_BASE_PATH = this.config.get<string>('API_BASE_PATH', '/api/v1');
    this.LOG_NAME = this.config.get<string>('LOG_NAME', 'service');
    this.LOG_LEVEL = this.config.get<PinoLevel>('LOG_LEVEL', 'debug');
    this.POSTGRES_HOST = this.config.get<string>('POSTGRES_HOST', '');
    this.POSTGRES_DB = this.config.get<string>('POSTGRES_DB', '');
    this.POSTGRES_PORT = this.config.get<number>('POSTGRES_PORT', 5432);
    this.POSTGRES_USER = this.config.get<string>('POSTGRES_USER', '');
    this.POSTGRES_PASSWORD = this.config.get<string>('POSTGRES_PASSWORD', '');
    this.JWT_ACCESS_TOKEN_SECRET = this.config.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
      '',
    );
    this.JWT_ACCESS_TOKEN_EXPIRATION_TIME = this.config.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      '7d',
    );
    this.JWT_REFRESH_TOKEN_EXPIRATION_TIME = this.config.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      '8d',
    );
    this.ALCHEMY_API = this.config.get<string>('ALCHEMY_API', '');
  }

  public isProduction(): boolean {
    return this.NODE_ENV === Environment.Production;
  }

  public isDevelopment(): boolean {
    return this.NODE_ENV === Environment.Development;
  }

  public isTest(): boolean {
    return this.NODE_ENV === Environment.Test;
  }

  public isStaging(): boolean {
    return this.NODE_ENV === Environment.Staging;
  }

  public isDebug(): boolean {
    return this.LOG_LEVEL === 'debug';
  }

  public getPinoConfig(): PinoParams {
    const pinoHttp: LoggerOptions = {
      name: this.LOG_NAME,
      level: this.LOG_LEVEL,
    };

    if (!this.isProduction()) {
      pinoHttp.transport = {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: true, translateTime: true },
      };
    }

    return { pinoHttp };
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

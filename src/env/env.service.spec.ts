import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import t from 'tap';
import { EnvService } from './env.service';

t.test('EnvService', (t) => {
  let service: EnvService;

  t.beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [EnvService],
    }).compile();

    service = module.get<EnvService>(EnvService);
  });

  t.test('should be defined', (t) => {
    t.ok(service);
    t.end();
  });

  t.test('isProduction', (t) => {
    t.test('should be false', (t) => {
      t.notOk(service.isProduction());
      t.end();
    });

    t.end();
  });

  t.test('isDevelopment', (t) => {
    t.test('should be false', (t) => {
      t.notOk(service.isDevelopment());
      t.end();
    });

    t.end();
  });

  t.test('isTest', (t) => {
    t.test('should be true', (t) => {
      t.ok(service.isTest());
      t.end();
    });

    t.end();
  });

  t.test('isStaging', (t) => {
    t.test('should be false', (t) => {
      t.notOk(service.isStaging());
      t.end();
    });

    t.end();
  });

  t.test('getPinoConfig', (t) => {
    t.test('should return a instance of PinoParams', (t) => {
      const config = service.getPinoConfig();

      t.type(config, 'object');
      t.hasOwnProps(config?.pinoHttp ?? {}, ['name', 'level', 'transport']);
      t.end();
    });

    t.end();
  });

  t.end();
});

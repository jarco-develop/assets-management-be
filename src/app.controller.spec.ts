import { Test, TestingModule } from '@nestjs/testing';
import t from 'tap';
import { AppController } from './app.controller';

t.test('AppController', (t) => {
  let appController: AppController;

  t.beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  t.test('should return "pong"', (t) => {
    t.equal(appController.ping(), 'pong');
    t.end();
  });

  t.end();
});

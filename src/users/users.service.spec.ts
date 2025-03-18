import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { getLoggerToken } from 'nestjs-pino';
import t from 'tap';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';

const mockUserRepository = {
  findOne: async (): Promise<Partial<User | null>> => Promise.resolve(null),
  create: (user: Partial<User>) => user,
  save: async (user: Partial<User>) => user,
};

const mockAuthService = {
  getAccessToken: async (userId: number) => ({
    accessToken: `access-${userId}`,
    refreshToken: `refresh-${userId}`,
  }),
  getDataFromRefreshToken: async (token: string) => {
    if (!token.startsWith('validToken-')) {
      throw new Error('Invalid token');
    }
    return { userId: 1, username: 'testuser' };
  },
};

t.test('UsersService', async (t) => {
  let service: UsersService;

  t.beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getLoggerToken(UsersService.name),
          useValue: { error: () => {} },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  t.test('getById - success', async (t) => {
    mockUserRepository.findOne = async () => ({
      id: 1,
      username: 'testuser',
    });

    const user = await service.getById(1);
    t.equal(user.id, 1);
    t.equal(user.username, 'testuser');
  });

  t.test('getById - user not found', async (t) => {
    mockUserRepository.findOne = async () => null;

    await t.rejects(
      () => service.getById(2),
      new NotFoundException('Invalid user id: 2'),
    );
  });

  t.test('create - success', async (t) => {
    mockUserRepository.findOne = async () => null; // No existing user
    mockUserRepository.create = (user) => ({ ...user, id: 1 });

    const authData = await service.create({
      username: 'newuser',
      password: 'password123',
      walletAddress: '0xABC',
    });

    t.match(authData.accessToken, /^access-1$/);
    t.match(authData.refreshToken, /^refresh-1$/);
  });

  t.test('create - username already exists', async (t) => {
    mockUserRepository.findOne = async () => ({
      id: 1,
      username: 'existinguser',
    });

    await t.rejects(
      () =>
        service.create({
          username: 'existinguser',
          password: 'password123',
          walletAddress: '0xDEF',
        }),
      new UnprocessableEntityException('Email existinguser already exists'),
    );
  });

  t.test('refreshToken - success', async (t) => {
    const token = 'validToken-1';
    mockUserRepository.findOne = async () => ({ id: 1, username: 'testuser' });

    const authData = await service.refreshToken(token);

    t.match(authData.accessToken, /^access-1$/);
    t.match(authData.refreshToken, /^refresh-1$/);
  });

  t.test('getUserByAuthToken - success', async (t) => {
    const authToken = 'Bearer validToken-1';
    mockUserRepository.findOne = async () => ({
      id: 1,
      username: 'testuser',
      walletAddress: '0x123',
    });

    const userData = await service.getUserByAuthToken(authToken);

    t.equal(userData.username, 'testuser');
    t.equal(userData.walletAddress, '0x123');
  });

  t.test('login - success', async (t) => {
    mockUserRepository.findOne = async () => ({
      id: 1,
      username: 'testuser',
      password: await hash('password123', 10),
    });

    const authData = await service.login('testuser', 'password123');

    t.match(authData.accessToken, /^access-1$/);
    t.match(authData.refreshToken, /^refresh-1$/);
  });

  t.end();
});

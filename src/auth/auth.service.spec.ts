import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import t from 'tap';
import { TokenPayload } from './auth.interfaces';
import { AuthService } from './auth.service';
import { EnvService } from '../env/env.service';

const mockJwtService = {
  signAsync: async (payload: TokenPayload, options?: JwtSignOptions) =>
    `mockedToken-${payload.userId}-${options?.expiresIn || 'default'}`,
  verify: (token: string) => {
    if (token.startsWith('mockedToken-')) {
      const parts = token.split('-');
      return { userId: Number(parts[1]), username: 'testuser' };
    }
    throw new Error('Invalid token');
  },
};

const mockEnvService = {
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
};

t.test('AuthService', async (t) => {
  let service: AuthService;

  t.beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EnvService,
          useValue: mockEnvService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  t.test('getAccessToken - success', async (t) => {
    const userId = 1;
    const username = 'testuser';

    const tokens = await service.getAccessToken(userId, username);

    t.match(
      tokens.accessToken,
      /^mockedToken-1-default$/,
      'Access token format should be correct',
    );
    t.match(
      tokens.refreshToken,
      /^mockedToken-1-7d$/,
      'Refresh token format should be correct',
    );
  });

  t.test('getDataFromRefreshToken - success', async (t) => {
    const token = 'mockedToken-1-default';
    const payload = await service.getDataFromRefreshToken(token);

    t.equal(payload.userId, 1);
    t.equal(payload.username, 'testuser');
  });

  t.test('getDataFromRefreshToken - invalid token', async (t) => {
    const invalidToken = 'invalidToken';

    await t.rejects(
      () => service.getDataFromRefreshToken(invalidToken),
      'Invalid token',
    );
  });

  t.end();
});

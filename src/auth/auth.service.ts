import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthData, TokenPayload } from './auth.interfaces';
import { EnvService } from '../env/env.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly env: EnvService,
  ) {}

  public async getAccessToken(
    userId: number,
    username: string,
  ): Promise<AuthData> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ username, userId }),
      this.jwtService.signAsync(
        { username, userId: userId },
        { expiresIn: this.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async getDataFromRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verify<TokenPayload>(token);
  }
}

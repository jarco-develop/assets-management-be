import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (env: EnvService) => {
        return {
          secret: env.JWT_ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
        };
      },
    }),
    EnvModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

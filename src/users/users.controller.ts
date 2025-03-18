import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AuthTokenResponse, UserDataResponse } from './user.responses';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a User and get an access token' })
  @ApiResponse({
    status: 200,
    description: 'auth data',
    type: () => AuthTokenResponse,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AuthTokenResponse> {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'auth data',
    type: () => AuthTokenResponse,
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthTokenResponse> {
    return this.usersService.login(
      loginUserDto.username,
      loginUserDto.password,
    );
  }

  @Post('/refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an access token from a refresh token' })
  @ApiResponse({
    status: 200,
    description: 'auth data',
    type: () => AuthTokenResponse,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthTokenResponse> {
    return this.usersService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an User by bearer token in headers' })
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: () => UserDataResponse,
  })
  async getUserByAuthToken(
    @Req() req: FastifyRequest,
  ): Promise<UserDataResponse> {
    return this.usersService.getUserByAuthToken(
      req?.headers?.authorization || '',
    );
  }
}

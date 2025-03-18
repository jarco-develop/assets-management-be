import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { AuthData } from '../auth/auth.interfaces';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { UserDataResponse } from './user.responses';
import { UserArgs } from './users.interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    protected readonly logger: PinoLogger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  public async getById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Invalid user id: ${id}`);
    }

    return user;
  }

  public async create(args: UserArgs): Promise<AuthData> {
    const { username, password, walletAddress } = args;
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new UnprocessableEntityException(
        `Email ${username} already exists`,
      );
    }

    const newUser = this.userRepository.create({
      username,
      password,
      walletAddress,
    });

    await this.userRepository.save(newUser);

    const authData = await this.authService.getAccessToken(
      newUser.id,
      newUser.username,
    );

    return authData;
  }

  public async refreshToken(token: string): Promise<AuthData> {
    const data = await this.authService.getDataFromRefreshToken(token);
    const user = await this.getById(data.userId);

    const authData = await this.authService.getAccessToken(
      user.id,
      user.username,
    );

    return authData;
  }

  public async getUserByAuthToken(
    authToken: string,
  ): Promise<UserDataResponse> {
    const token = authToken.slice(7, authToken.length);
    const data = await this.authService.getDataFromRefreshToken(token);
    const user = await this.getById(data.userId);

    return {
      username: user?.username,
      walletAddress: user?.walletAddress,
    };
  }

  public async login(username: string, password: string): Promise<AuthData> {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
      });

      if (!user) {
        throw new Error('Invalid username');
      }

      const isValid = await compare(password, user.password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      const authData = await this.authService.getAccessToken(
        user.id,
        user.username,
      );

      return authData;
    } catch (err) {
      this.logger.error({ err }, 'Error trying to login');

      return {
        accessToken: '',
        refreshToken: '',
      };
    }
  }

  public async update(user: Partial<User>) {
    try {
      await this.userRepository.save(user);
    } catch (err) {
      this.logger.error({ err }, 'Error trying to update an user.');
    }
  }
}

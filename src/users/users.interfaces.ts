import { User } from './entities/user.entity';

export type UserArgs = Pick<User, 'username' | 'password' | 'walletAddress'>;

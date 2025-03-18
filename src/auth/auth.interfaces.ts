import { FastifyRequest } from 'fastify';

export interface TokenPayload {
  userId: number;
  username: string;
}

export interface RequestWithUser extends FastifyRequest {
  user: TokenPayload;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
}

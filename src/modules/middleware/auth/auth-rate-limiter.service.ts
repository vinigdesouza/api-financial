import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class AuthRateLimiterService {
  private rateLimiter: RateLimiterRedis;

  constructor() {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST, // Alterar se necessário
      port: Number(process.env.REDIS_PORT),
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 5, // Máximo de 5 tentativas
      duration: 60 * 3, // Contabiliza tentativas em 5 minutos
      blockDuration: 60 * 3, // Bloqueia por 3 minutos após o limite
      keyPrefix: 'jwt_fail',
    });
  }

  async check(ip: string) {
    try {
      await this.rateLimiter.consume(ip);
    } catch {
      throw new UnauthorizedException(
        'Too many attempts, please try again later.',
      );
    }
  }

  async reset(ip: string) {
    await this.rateLimiter.delete(ip);
  }
}

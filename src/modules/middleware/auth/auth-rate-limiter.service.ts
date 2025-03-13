import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class AuthRateLimiterService {
  private rateLimiter: RateLimiterRedis;

  constructor() {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 15, // Máximo de 15 tentativas
      duration: 60 * 3, // Contabiliza tentativas em 3 minutos
      blockDuration: 60 * 1, // Bloqueia por 1 minuto após o limite
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

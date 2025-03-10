import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { CustomLogger } from '../shared/custom.logger';

export enum userRoles {
  ADMIN = 'admin',
  BASIC = 'basic',
}

interface JwtPayload {
  sub: number;
  name: string;
  role: userRoles;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('JWT Middleware');
    const token = req.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const secretKey = this.configService.get<string>('SECRET_JWT') as string;

      if (!secretKey) {
        throw new UnauthorizedException('Secret key is not defined');
      }

      const decoded = jwt.verify(token.replace('Bearer ', ''), secretKey, {
        algorithms: ['HS256'],
        ignoreExpiration: true,
      }) as unknown as JwtPayload;

      if (![userRoles.ADMIN, userRoles.BASIC].includes(decoded.role)) {
        throw new UnauthorizedException('User can`t access');
      }
      req.user = decoded;
      next();
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error}`);
      throw new UnauthorizedException(`JWT validation failed: ${error}`);
    }
  }
}

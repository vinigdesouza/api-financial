import { Test, TestingModule } from '@nestjs/testing';
import { JwtMiddleware } from './jwt.middleware';
import { ConfigService } from '@nestjs/config';
import { AuthRateLimiterService } from './auth/auth-rate-limiter.service';
import {
  fakeAuthRateLimiterService,
  fakeConfigService,
  fakeLogger,
} from '../shared/test/common.faker';
import { CustomLogger } from '../shared/custom.logger';
import { faker } from '@faker-js/faker/.';

describe('JwtMiddleware', () => {
  let jwtMiddleware: JwtMiddleware;
  let req: any;
  let res: any;
  let next: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtMiddleware,
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
        {
          provide: AuthRateLimiterService,
          useValue: fakeAuthRateLimiterService,
        },
        {
          provide: CustomLogger,
          useValue: fakeLogger,
        },
      ],
    }).compile();

    jwtMiddleware = module.get<JwtMiddleware>(JwtMiddleware);
    req = {
      headers: {
        authorization: 'Bearer token',
      },
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an UnauthorizedException when token is missing', async () => {
    req.headers.authorization = undefined;
    req.ip = faker.internet.ip();

    fakeAuthRateLimiterService.check.mockResolvedValueOnce(true);

    await expect(jwtMiddleware.use(req, res, next)).rejects.toThrow(
      'Token is missing',
    );
    expect(fakeAuthRateLimiterService.check).toHaveBeenCalledTimes(1);
    expect(fakeAuthRateLimiterService.check).toHaveBeenCalledWith(req.ip);
  });

  it('should return an UnauthorizedException when SECRET_JWT is not defined', async () => {
    req.headers.authorization = `Bearer token`;
    req.ip = faker.internet.ip();

    fakeAuthRateLimiterService.check.mockResolvedValueOnce(true);
    fakeConfigService.get.mockReturnValueOnce(undefined);

    await expect(jwtMiddleware.use(req, res, next)).rejects.toThrow(
      'JWT validation failed: UnauthorizedException: Secret key is not defined',
    );
    expect(fakeConfigService.get).toHaveBeenCalledTimes(1);
    expect(fakeConfigService.get).toHaveBeenCalledWith('SECRET_JWT');
  });

  it('should return an UnauthorizedException when JWT malformed', async () => {
    req.headers.authorization = `Bearer token`;
    req.ip = faker.internet.ip();

    fakeAuthRateLimiterService.check.mockResolvedValueOnce(true);
    fakeConfigService.get.mockReturnValueOnce(
      'my-super-secret-key-to-autenticate',
    );

    await expect(jwtMiddleware.use(req, res, next)).rejects.toThrow(
      'JWT validation failed: JsonWebTokenError: jwt malformed',
    );
    expect(fakeConfigService.get).toHaveBeenCalledTimes(1);
    expect(fakeConfigService.get).toHaveBeenCalledWith('SECRET_JWT');
  });

  it('should return an UnauthorizedException when token with roles invald', async () => {
    req.headers.authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlZpbmljaXVzIGRlIHNvdXphIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1MTYyMzkwMjJ9.L9CQD3KfDzSGN63-Mj1UXlX5erbgDFh9jbrOUbmVFdw`;
    req.ip = faker.internet.ip();

    fakeAuthRateLimiterService.check.mockResolvedValueOnce(true);
    fakeConfigService.get.mockReturnValueOnce(
      'my-super-secret-key-to-autenticate',
    );

    await expect(jwtMiddleware.use(req, res, next)).rejects.toThrow(
      'User can`t access',
    );
    expect(fakeConfigService.get).toHaveBeenCalledTimes(1);
    expect(fakeConfigService.get).toHaveBeenCalledWith('SECRET_JWT');
    expect(fakeAuthRateLimiterService.check).toHaveBeenCalledTimes(1);
    expect(fakeAuthRateLimiterService.check).toHaveBeenCalledWith(req.ip);
  });

  it('should pass by validation when token is valid', async () => {
    req.headers.authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxNzE3MTU1fQ.vPBO20d-cN4FSpgjfw9SFHQh3yIHmobfwLBSV4TR6gk`;
    req.ip = faker.internet.ip();

    fakeConfigService.get.mockReturnValueOnce(
      'my-super-secret-key-to-autenticate',
    );

    await expect(jwtMiddleware.use(req, res, next)).resolves.not.toThrow();
    expect(fakeConfigService.get).toHaveBeenCalledTimes(1);
    expect(fakeConfigService.get).toHaveBeenCalledWith('SECRET_JWT');
  });
});

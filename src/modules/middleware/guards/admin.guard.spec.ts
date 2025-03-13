import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';
import { userRoles } from '../jwt.middleware';

describe('AdminGuard', () => {
  let adminGuard: AdminGuard;
  let context: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    adminGuard = module.get<AdminGuard>(AdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an UnauthorizedException when user not exists', () => {
    context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    };

    expect(() => adminGuard.canActivate(context)).toThrow(
      'Access restricted to admins only',
    );
  });

  it('should return an UnauthorizedException when user role is not ADMIN', () => {
    context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: 'BASIC',
          },
        }),
      }),
    };

    expect(() => adminGuard.canActivate(context)).toThrow(
      'Access restricted to admins only',
    );
  });

  it('should return true when user role is ADMIN', () => {
    context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: userRoles.ADMIN,
          },
        }),
      }),
    };

    expect(adminGuard.canActivate(context)).toBe(true);
  });
});

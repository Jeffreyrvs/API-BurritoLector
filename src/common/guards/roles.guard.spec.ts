import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function mockContext(userRole: Role | undefined, requiredRoles: Role[] | undefined): ExecutionContext {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: userRole ? { role: userRole } : undefined }),
      }),
    } as unknown as ExecutionContext;
  }

  it('permite el acceso cuando no hay decorador @Roles', () => {
    const ctx = mockContext(Role.USER, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite al ADMIN acceder a rutas protegidas por ADMIN', () => {
    const ctx = mockContext(Role.ADMIN, [Role.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lanza ForbiddenException para usuario con rol USER en ruta ADMIN', () => {
    const ctx = mockContext(Role.USER, [Role.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si user es undefined', () => {
    const ctx = mockContext(undefined, [Role.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

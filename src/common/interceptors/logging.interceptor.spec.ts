import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockContext(method = 'GET', url = '/test'): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
      }),
    } as unknown as ExecutionContext;
  }

  function mockHandler(data: unknown): CallHandler {
    return { handle: () => of(data) };
  }

  it('devuelve la respuesta sin modificarla', done => {
    interceptor.intercept(mockContext(), mockHandler({ id: 1 })).subscribe(result => {
      expect(result).toEqual({ id: 1 });
      done();
    });
  });

  it('llama a console.log al completar la petición', done => {
    interceptor.intercept(mockContext('POST', '/auth/login'), mockHandler({})).subscribe(() => {
      expect(console.log).toHaveBeenCalled();
      done();
    });
  });
});

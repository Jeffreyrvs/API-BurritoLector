import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  function mockContext(statusCode: number): ExecutionContext {
    return {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    } as unknown as ExecutionContext;
  }

  function mockHandler(data: unknown): CallHandler {
    return { handle: () => of(data) };
  }

  it('envuelve la respuesta en { success, data, statusCode }', done => {
    interceptor.intercept(mockContext(200), mockHandler({ token: 'abc' })).subscribe(result => {
      expect(result).toEqual({ success: true, data: { token: 'abc' }, statusCode: 200 });
      done();
    });
  });

  it('usa el statusCode real de la respuesta HTTP', done => {
    interceptor.intercept(mockContext(201), mockHandler({ id: 1 })).subscribe(result => {
      expect(result).toEqual({ success: true, data: { id: 1 }, statusCode: 201 });
      done();
    });
  });

  it('funciona con datos nulos o undefined', done => {
    interceptor.intercept(mockContext(204), mockHandler(null)).subscribe(result => {
      expect(result).toEqual({ success: true, data: null, statusCode: 204 });
      done();
    });
  });
});

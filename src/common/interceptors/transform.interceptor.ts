import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TransformResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TransformResponse<T>> {
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        statusCode: response.statusCode,
      })),
    );
  }
}

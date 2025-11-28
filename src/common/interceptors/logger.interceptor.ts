import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextHttp = context.switchToHttp();
    const request = contextHttp.getRequest<Request>();
    const response = contextHttp.getResponse<Response>();
    const startTime = (request as any)._startTime ?? Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        let responseBody: string;
        try {
          responseBody =
            data && typeof data === 'object'
              ? JSON.stringify(data)
              : String(data);
        } catch (e) {
          responseBody = 'Nenhum body na resposta.';
        }

        console.log(
          `[Response] ${method} ${url} - Status: ${response.statusCode} - Time: ${duration}ms - Size: ${
            responseBody.length
          } bytes`,
        );
        console.log('  Body:', responseBody);
      }),
    );
  }
}

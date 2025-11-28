import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl } = request;

    console.log(`[Request] ${method} ${originalUrl}`);
    if (request.body) {
      console.log('  Body:', request.body);
    }

    (request as any)._startTime = Date.now();

    next();
  }
}

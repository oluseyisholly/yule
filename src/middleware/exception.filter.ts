import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StandardResopnse } from 'src/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost)  {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (exception instanceof BadRequestException) {
      let message = exception.getResponse() as any;
      message = message.message;
      return response.status(status).json({
        code: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception instanceof InternalServerErrorException) {
        let message = exception.message || "An Unknown Error Occurred"
        return response.status(status).json({
          code: status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }

    return response.status(status).json({
      code: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

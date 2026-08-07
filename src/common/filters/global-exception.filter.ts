import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal Server Error';
    let errorType = 'System Error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message || response;
      errorType = (response as any).error || 'Http Exception';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      errorType = 'Database Error';
      switch (exception.code) {
        case 'P2002':
          message = 'A unique constraint failed on the database.';
          break;
        case 'P2025':
          message = 'Record not found.';
          httpStatus = HttpStatus.NOT_FOUND;
          break;
        default:
          message = `Prisma error: ${exception.code}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`[Unhandled Error] ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`[Unknown Error]`, exception);
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
      errorType,
    };

    if (httpStatus >= 500) {
      this.logger.error(
        `HTTP ${httpStatus} Error: ${httpAdapter.getRequestUrl(ctx.getRequest())}`,
        exception instanceof Error ? exception.stack : ''
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

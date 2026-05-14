import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { REQUEST_ID_HEADER } from '../constants/request-context';
import type { ApiError } from '../api/api-response';

type ErrorResponseBody = string | { message?: unknown; error?: string; statusCode?: number };
type HttpRequest = {
  method: string;
  url: string;
};
type HttpResponse = {
  getHeader(name: string): number | string | string[] | undefined;
  status(statusCode: number): { json(payload: ApiError): void };
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<HttpResponse>();
    const request = context.getRequest<HttpRequest>();
    const requestId = response.getHeader(REQUEST_ID_HEADER)?.toString();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorBody = exception instanceof HttpException ? exception.getResponse() : undefined;

    if (status >= 500) {
      this.logger.error(
        `Unhandled request failure ${request.method} ${request.url.split('?')[0]}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const payload: ApiError = {
      error: {
        code: getErrorCode(status, errorBody),
        message: getErrorMessage(status, errorBody),
      },
    };

    if (requestId) {
      payload.error.requestId = requestId;
    }

    response.status(status).json(payload);
  }
}

function getErrorCode(status: number, body: unknown): string {
  if (isErrorObject(body) && body.error) {
    return body.error.toUpperCase().replaceAll(' ', '_');
  }

  return status >= 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`;
}

function getErrorMessage(status: number, body: unknown): string {
  if (typeof body === 'string') {
    return body;
  }

  if (isErrorObject(body)) {
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }

    if (typeof body.message === 'string') {
      return body.message;
    }
  }

  return status >= 500 ? 'Internal server error' : 'Request failed';
}

function isErrorObject(value: unknown): value is Exclude<ErrorResponseBody, string> {
  return typeof value === 'object' && value !== null;
}

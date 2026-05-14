import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { REQUEST_ID_HEADER } from '../constants/request-context';
import { MetricsService } from '../metrics/metrics.service';

type HttpRequest = {
  method: string;
  path?: string;
  url: string;
};

type HttpResponse = {
  statusCode: number;
  getHeader(name: string): number | string | string[] | undefined;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  constructor(private readonly metrics?: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<HttpRequest>();
    const response = http.getResponse<HttpResponse>();

    return next.handle().pipe(
      tap(() => this.logRequest(request, response, startedAt)),
      catchError((error: unknown) => {
        this.logRequest(request, response, startedAt, this.statusCodeFromError(error));
        return throwError(() => error);
      }),
    );
  }

  private logRequest(
    request: HttpRequest,
    response: HttpResponse,
    startedAt: number,
    fallbackStatusCode?: number,
  ): void {
    const durationMs = Date.now() - startedAt;
    const requestId = response.getHeader(REQUEST_ID_HEADER);
    const statusCode = fallbackStatusCode ?? response.statusCode;
    this.metrics?.recordRequest(statusCode, durationMs);
    const message = JSON.stringify({
      requestId,
      method: request.method,
      path: request.path ?? request.url.split('?')[0],
      statusCode,
      durationMs,
    });

    if (statusCode >= 500) {
      this.logger.error(message);
      return;
    }

    if (statusCode >= 400) {
      this.logger.warn(message);
      return;
    }

    this.logger.log(message);
  }

  private statusCodeFromError(error: unknown): number {
    if (
      typeof error === 'object' &&
      error !== null &&
      'getStatus' in error &&
      typeof error.getStatus === 'function'
    ) {
      return error.getStatus();
    }

    return 500;
  }
}

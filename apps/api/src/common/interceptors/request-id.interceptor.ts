import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { REQUEST_ID_HEADER } from '../constants/request-context';

type HttpRequest = {
  header(name: string): string | undefined;
};
type HttpResponse = {
  setHeader(name: string, value: string): void;
};

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<HttpRequest>();
    const response = http.getResponse<HttpResponse>();
    const incomingRequestId = request.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId && incomingRequestId.length <= 128 ? incomingRequestId : randomUUID();

    response.setHeader(REQUEST_ID_HEADER, requestId);

    return next.handle();
  }
}

import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, NEVER, Observable, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { RequestTimeoutInterceptor } from './request-timeout.interceptor';

describe('RequestTimeoutInterceptor', () => {
  it('passes through fast requests', async () => {
    const interceptor = new RequestTimeoutInterceptor(configWithTimeout(20));
    const result = await firstValueFrom(interceptor.intercept(mockContext(), mockHandler(of('ok'))));

    expect(result).toBe('ok');
  });

  it('converts hung requests to request timeout errors', async () => {
    const interceptor = new RequestTimeoutInterceptor(configWithTimeout(1));

    await expect(firstValueFrom(interceptor.intercept(mockContext(), mockHandler(NEVER)))).rejects.toMatchObject({
      status: 408,
    });
  });
});

function configWithTimeout(timeoutMs: number): ConfigService {
  return {
    get: (key: string) => (key === 'REQUEST_TIMEOUT_MS' ? timeoutMs : undefined),
  } as ConfigService;
}

function mockContext(): ExecutionContext {
  return {} as ExecutionContext;
}

function mockHandler(result: Observable<unknown>): CallHandler {
  return {
    handle: () => result,
  };
}

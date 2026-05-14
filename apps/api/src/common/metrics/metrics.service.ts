import { Injectable } from '@nestjs/common';

type WorkerMetrics = {
  ready: boolean;
  waiting: number;
  active: number;
  failed: number;
};

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalDurationMs = 0;
  private worker: WorkerMetrics = {
    ready: false,
    waiting: 0,
    active: 0,
    failed: 0,
  };

  recordRequest(statusCode: number, durationMs: number): void {
    this.requestCount += 1;
    this.totalDurationMs += durationMs;

    if (statusCode >= 500) {
      this.errorCount += 1;
    }
  }

  setWorkerMetrics(worker: Partial<WorkerMetrics>): void {
    this.worker = {
      ...this.worker,
      ...worker,
    };
  }

  snapshot() {
    return {
      requests: {
        count: this.requestCount,
        errors: this.errorCount,
        averageDurationMs:
          this.requestCount === 0 ? 0 : Math.round(this.totalDurationMs / this.requestCount),
      },
      worker: this.worker,
    };
  }
}

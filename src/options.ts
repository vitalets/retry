import { SeriesParams } from './series.js';

export interface RetryOptions {
  /** number of retires */
  retries?: number;
  /** delays between retries */
  delay?: SeriesParams;
  /** timeouts for fn calls */
  timeout?: SeriesParams;
  /** total timeout */
  totalTimeout?: number;
  /** abort signal to stop retries */
  signal?: AbortSignal;
  /** check error to continue retries or not */
  isRetryError?: (e: Error) => boolean;
  /** check error to increase fn timeout */
  isTimeoutError?: (e: Error) => boolean;
  /** called every time before retry */
  beforeRetry?: (params: BeforeRetryParams) => unknown;
}

export interface BeforeRetryParams {
  e: Error;
  retry: number;
  delay: number;
  timeout?: number;
}

export interface RetryFnParams {
  timeout?: number;
}

export type RetryFn<T> = (params: RetryFnParams) => Promise<T>;

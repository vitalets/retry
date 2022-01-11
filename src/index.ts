import { RetryFn, RetryOptions } from './options.js';
import { Series, seriesFactory } from './series.js';
import { wait } from './utils.js';

export { RetryFn, RetryOptions };

export async function withRetry<T>(fn: RetryFn<T>, options: RetryOptions = {}) {
  return new WithRetry(fn, options).run();
}

export const defaults: Required<Pick<RetryOptions, 'retries' | 'delay' | 'isRetryError' | 'isTimeoutError'>> = {
  retries: 3,
  delay: { min: 100, factor: 2, max: 30 * 1000 },
  isRetryError: () => true,
  isTimeoutError: e => /timeout/i.test(e?.message),
};

class WithRetry<T> {
  options: RetryOptions & typeof defaults;
  delaySeries: Series;
  timeoutSeries?: Series;
  retry = 0;
  startTime = 0;
  fnAbortController?: AbortController;

  constructor(protected fn: RetryFn<T>, options: RetryOptions = {}) {
    this.options = Object.assign({}, defaults, options);
    const { delay, timeout } = this.options;
    this.delaySeries = seriesFactory(delay);
    if (timeout) this.timeoutSeries = seriesFactory(timeout);
  }

  get currentDelay() {
    return this.delaySeries.current;
  }

  get currentTimeout() {
    return this.timeoutSeries?.current;
  }

  async run() {
    this.startTime = Date.now();
    while (true) {
      try {
        return await this.callFn();
      } catch (e) {
        await this.handleError(e);
      }
    }
  }

  private async callFn() {
    const timeout = this.currentTimeout;
    const { signal } = this.fnAbortController = new AbortController();
    const fnPromise = this.fn({ timeout, signal });
    if (timeout) {
      const timeoutPromise = this.getTimeoutPromise(timeout);
      return Promise.race([ fnPromise, timeoutPromise ]);
    } else {
      return fnPromise;
    }
  }

  private async handleError(e: Error) {
    this.fnAbortController?.abort();
    if (this.stopRetryBeforeWait(e)) throw e;
    this.prepareRetry(e);
    await wait(this.currentDelay);
    // check again as total timeout and total signal can block retry here
    if (this.stopRetryAfterWait()) throw e;
    this.callBeforeRetry(e);
  }

  private stopRetryBeforeWait(e: Error) {
    return !this.options.isRetryError(e)
      || this.isRetriesReached()
      || this.isTotalTimeoutReached()
      || this.isAborted();
  }

  private stopRetryAfterWait() {
    return this.isTotalTimeoutReached()
      || this.isAborted();
  }

  private prepareRetry(e: Error) {
    this.retry++;
    this.incrementDelay();
    this.incrementTimeout(e);
  }

  private callBeforeRetry(e: Error) {
    this.options.beforeRetry?.({
      e,
      retry: this.retry,
      delay: this.currentDelay,
      timeout: this.currentTimeout,
    });
  }

  private incrementTimeout(e: Error) {
    if (this.timeoutSeries && this.options.isTimeoutError(e)) {
      this.timeoutSeries.next();
    }
  }

  private incrementDelay() {
    if (this.retry > 1) this.delaySeries.next();
  }

  private async getTimeoutPromise(timeout: number) {
    // use .then() instead of await to return Promise<never> instead of Promise<void>
    return wait(timeout).then(() => Promise.reject(new Error(`Timeout ${timeout}ms`)));
  }

  private isTotalTimeoutReached() {
    const { totalTimeout } = this.options;
    return totalTimeout && (Date.now() - this.startTime) > totalTimeout;
  }

  private isRetriesReached() {
    return this.retry >= this.options.retries;
  }

  private isAborted() {
    return Boolean(this.options.signal?.aborted);
  }
}

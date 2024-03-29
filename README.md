# @vitalets/retry
Retry async function with exponential delay, timeouts and abort signals.

## Features
* exponential delays
* exponential timeouts
* abort signals

## Usage
```ts
import { withRetry, RetryFn } from '@vitalets/retry';

const fn: RetryFn = async ({ signal }) => {
  const res = await fetch('https://example.com', { signal });
  if (!res.ok) throw new Error(`Status ${res.status} ${await res.text()}`);
  return res.json();
};

const result = await withRetry(fn, {
  retries: 5,
  delay: [ 100, 200, 500 ],   // or exponential { min: 100, factor: 2, max: 1000 }
  timeout: [ 300, 400, 1000 ], // or exponential { min: 300, factor: 2, max: 1000 }
  onBeforeRetry: ({ e, retry, timeout }) => {
    console.log(`${e?.message}. Retry #${retry} with timeout ${timeout}ms`);
  },
});
```

## Installation
```
npm i @vitalets/retry
```
> Note: this package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)

## Options
See [src/options.ts](https://github.com/vitalets/retry/blob/main/src/options.ts).

## Related
* [exponential-backoff](https://github.com/coveooss/exponential-backoff)

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

# @vitalets/retry
Retry async function with exponential delay, timeouts and abort signals.

## Features
* exponential delays
* exponential timeouts
* abort signals

## Usage
```ts
import { withRetry } from '@vitalets/retry';

const result = await withRetry(({ signal }) => fetch('https://example.com', { signal }), {
  retries: 5,
  delay: [ 100, 200, 500 ],   // or exponential { min: 100, factor: 2, max: 1000 }
  timeout: [ 300, 400, 1000 ] // or exponential { min: 300, factor: 2, max: 1000 }
  onBeforeRetry: ({ e, retry, timeout }) => {
    console.log(`${e?.message}. Retry #${retry} with timeout ${timeout}ms`);
  }
});
```

## Installation
```
npm i @vitalets/retry
```

## Options
tbd

## Related
* [exponential-backoff](https://github.com/coveooss/exponential-backoff)

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

import { wait } from '../src/utils.js';

export type CallDefinition = {
  time?: number;
  result?: unknown;
}

/**
 * Helper to create async function for retries.
 */
export function createFn(calls: CallDefinition[]) {
  let call = -1;
  return async () => {
    call++;
    if (call >= calls.length) {
      throw new Error(`Call attempt ${call} exceeds calls definition ${calls}`);
    }
    const { time, result } = calls[call];
    if (time) await wait(time);
    if (result instanceof Error) throw result;
    return result;
  };
}

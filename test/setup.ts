import assert from 'assert';
import sinon from 'sinon';
import { withRetry, defaults } from '../src/index.js';

type Assert = typeof assert.strict;
type sinon = typeof sinon;
type withRetryType = typeof withRetry;

defaults.delay = 10;

declare global {
  const assert: Assert;
  const sinon: sinon;
  const withRetry: withRetryType;
}

Object.assign(global, {
  assert: assert.strict,
  sinon,
  withRetry,
});

afterEach(() => {
  sinon.restore();
});

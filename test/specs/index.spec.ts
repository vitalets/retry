import { wait } from '../../src/utils.js';

describe('retry', () => {

  it('dont retry on success', async () => {
    const fn = sinon.stub().resolves(42);
    const res = await withRetry(fn);
    assert.equal(res, 42);
    sinon.assert.callCount(fn, 1);
  });

  it('retry on error', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const promise = withRetry(fn, { retries: 2 });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 3);
  });

  it('success after retry', async () => {
    const fn = sinon.stub()
      .onCall(0).rejects(new Error('foo'))
      .onCall(1).resolves(42);
    const res = await withRetry(fn);
    assert.equal(res, 42);
    sinon.assert.callCount(fn, 2);
  });

  it('delay', async () => {
    const fn = sinon.stub().callsFake(() => wait(30).then(() => 42));
    const res = await withRetry(fn, { retries: 3, timeout: [ 10, 20, 50 ] });
    assert.equal(res, 42);
    sinon.assert.callCount(fn, 3);
  });

  it('beforeRetry', async () => {
    const e = new Error('foo');
    const fn = sinon.stub().rejects(e);
    const beforeRetry = sinon.stub();
    const promise = withRetry(fn, {
      retries: 2,
      delay: [ 10, 20 ],
      timeout: [ 10, 20 ],
      beforeRetry,
    });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(beforeRetry, 2);
    assert.deepEqual(beforeRetry.getCall(0).args[0], { e, retry: 1, delay: 10, timeout: 10 });
    assert.deepEqual(beforeRetry.getCall(1).args[0], { e, retry: 2, delay: 20, timeout: 10 });
  });

  it('isRetryError', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const promise = withRetry(fn, {
      retries: 3,
      timeout: [ 10, 20, 30 ],
      isRetryError: e => !/foo/.test(e.message)
    });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 1);
  });
});

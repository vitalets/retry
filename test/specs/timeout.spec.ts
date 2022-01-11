describe('timeout', () => {

  it('const timeout', async () => {
    const fn = sinon.stub().rejects(new Error('timeout'));
    const promise = withRetry(fn, { retries: 3, timeout: 10 });
    await assert.rejects(promise, /timeout/);
    sinon.assert.callCount(fn, 4);
    assert.deepEqual(fn.getCall(0).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(1).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(2).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(3).args[0].timeout, 10);
  });

  it('exponential timeout', async () => {
    const fn = sinon.stub().rejects(new Error('timeout'));
    const promise = withRetry(fn, { retries: 3, timeout: { min: 10, max: 50 }});
    await assert.rejects(promise, /timeout/);
    sinon.assert.callCount(fn, 4);
    assert.deepEqual(fn.getCall(0).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(1).args[0].timeout, 20);
    assert.deepEqual(fn.getCall(2).args[0].timeout, 40);
    assert.deepEqual(fn.getCall(3).args[0].timeout, 50);
  });

  it('custom timeout', async () => {
    const fn = sinon.stub().rejects(new Error('timeout'));
    const promise = withRetry(fn, { retries: 3, timeout: [ 10, 20, 30 ] });
    await assert.rejects(promise, /timeout/);
    sinon.assert.callCount(fn, 4);
    assert.deepEqual(fn.getCall(0).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(1).args[0].timeout, 20);
    assert.deepEqual(fn.getCall(2).args[0].timeout, 30);
    assert.deepEqual(fn.getCall(3).args[0].timeout, 30);
  });

  it('total timeout', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const promise = withRetry(fn, { retries: 3, delay: 50, totalTimeout: 80 });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 2);
  });

  it('isTimeoutError', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const promise = withRetry(fn, {
      retries: 3,
      timeout: [ 10, 20, 30 ],
      isTimeoutError: e => /foo/.test(e.message)
    });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 4);
    assert.deepEqual(fn.getCall(0).args[0].timeout, 10);
    assert.deepEqual(fn.getCall(1).args[0].timeout, 20);
    assert.deepEqual(fn.getCall(2).args[0].timeout, 30);
    assert.deepEqual(fn.getCall(3).args[0].timeout, 30);
  });
});

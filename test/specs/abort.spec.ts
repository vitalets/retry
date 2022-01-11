describe('abort', () => {

  it('pass abort signal to fn and abort on error', async () => {
    const fn = sinon.stub()
      .onCall(0).rejects(new Error('foo'))
      .onCall(1).rejects(new Error('bar'))
      .onCall(2).resolves(42);
    const res = await withRetry(fn, { retries: 2 });
    assert.equal(res, 42);
    sinon.assert.callCount(fn, 3);
    assert.equal(fn.getCall(0).args[0].signal.aborted, true);
    assert.equal(fn.getCall(1).args[0].signal.aborted, true);
    assert.equal(fn.getCall(2).args[0].signal.aborted, false);
  });

  it('total abort', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 150);
    const promise = withRetry(fn, { retries: 5, delay: 100, signal: controller.signal });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 2);
  });

});

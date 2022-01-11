describe('abort', () => {

  // todo: test fn abort signal

  it('total abort', async () => {
    const fn = sinon.stub().rejects(new Error('foo'));
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 80);
    const promise = withRetry(fn, { retries: 5, delay: 50, signal: controller.signal });
    await assert.rejects(promise, /foo/);
    sinon.assert.callCount(fn, 3);
  });

});

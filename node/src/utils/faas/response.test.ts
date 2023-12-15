import response from './response';

describe('faas response', () => {
  it('should return a object with the right body', async () => {
    const res = response(200, { cool: 'stuff' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('stuff');
  });

  it('should add headers', async () => {
    const res = response(500, {}, { hello: 'hey' });
    expect(res.statusCode).toBe(500);
    expect(res.headers?.hello).toEqual('hey');
  });
});

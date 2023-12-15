import * as funcs from '../faas';

import { constructAPIGwEvent } from './utils/helpers';
import routeNotFoundEvent from './events/route-not-found';
import postMethodEvent from './events/method';

describe('lambdaHandler', () => {
  it('should return a 404 when module is not found', async () => {
    const event = constructAPIGwEvent(routeNotFoundEvent);
    const result = await funcs.lambdaHandler(event);

    expect(result.statusCode).toBe(500);
  });

  it('should return a function', async () => {
    const method = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'so good' }),
        });
      }, 300);
    });

    const methodMock = jest.fn(() => method);

    const mock = jest.spyOn(funcs, 'lazyLoad');
    mock.mockImplementation(() => {
      return { default: methodMock } as unknown as Promise<any>;
    });

    const event = constructAPIGwEvent(postMethodEvent);
    const result = await funcs.lambdaHandler(event);
    expect(result.statusCode).toBe(200);
    expect(methodMock).toBeCalled();
  });

  it('should return json from function', async () => {
    const mock = jest.spyOn(funcs, 'lazyLoad');
    mock.mockImplementation(() => {
      return Promise.resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'good' }),
      });
    });

    const event = constructAPIGwEvent(postMethodEvent);
    const result = await funcs.lambdaHandler(event);
    expect(result.statusCode).toBe(200);
    expect(result.body.includes('good')).toBe(true);
  });

  it('should return a 500 if function throws error', async () => {
    const mock = jest.spyOn(funcs, 'lazyLoad');
    mock.mockImplementation(() => {
      throw new Error('BAD!');
    });

    const event = constructAPIGwEvent(postMethodEvent);
    const result = await funcs.lambdaHandler(event);
    expect(result.statusCode).toBe(500);
  });
});

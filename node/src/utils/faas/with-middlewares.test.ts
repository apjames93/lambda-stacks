import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import withMiddlewares from './with-middlewares';

describe('withMiddlewares', () => {
  const event = {} as APIGatewayProxyEvent;
  const callback = { statusCode: 200 } as APIGatewayProxyResult;

  it('should call all middlewares before calling the handler', async () => {
    const middleware1 = jest.fn().mockResolvedValue(callback);
    const middleware2 = jest.fn().mockResolvedValue(callback);
    const handler = jest.fn().mockResolvedValue('success');

    const result = await withMiddlewares(event, [middleware1, middleware2], handler);

    expect(result).toEqual('success'); // Make sure the return value is correct
    expect(middleware1).toHaveBeenCalledWith(event); // Make sure the first middleware was called with the event
    expect(middleware2).toHaveBeenCalledWith(event); // Make sure the second middleware was called with the event
    expect(handler).toHaveBeenCalledWith(event); // Make sure the handler was called with the event
  });

  it('should stop executing middlewares if one returns an error', async () => {
    const callbackWithError = { statusCode: 500 } as APIGatewayProxyResult;
    const middleware1 = jest.fn().mockResolvedValue(callbackWithError);
    const middleware2 = jest.fn();
    const handler = jest.fn();

    const result = await withMiddlewares(event, [middleware1, middleware2], handler);

    expect(result).toEqual(callbackWithError); // Make sure the error is returned
    expect(middleware1).toHaveBeenCalledWith(event); // Make sure the first middleware was called with the event
    expect(middleware2).not.toHaveBeenCalled(); // Make sure the second middleware was not called
    expect(handler).not.toHaveBeenCalled(); // Make sure the handler was not called
  });

  it('should return a 500 error if a middleware throws an error', async () => {
    const middlewareWithError = jest.fn().mockRejectedValue(new Error('Internal server error'));
    const handler = jest.fn();

    const result = await withMiddlewares(event, [middlewareWithError], handler);

    expect(result.statusCode).toEqual(500); // Make sure a 500 error is returned
    expect(middlewareWithError).toHaveBeenCalledWith(event); // Make sure the middleware was called with the event
    expect(handler).not.toHaveBeenCalled(); // Make sure the handler was not called
  });
});

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import response from './response';

/**
 * @param event a lambda event
 * @param middlewares middleware functions that process a lambda event before lambdas
 * @param handler a lambda function
 * @returns APIGatewayProxyResult
 */
const withMiddlewares = async (
  event: APIGatewayProxyEvent,
  middlewares: ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>)[],
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>,
) => {
  for (const middleware of middlewares) {
    try {
      const callback = await middleware(event);
      if (callback.statusCode !== 200) {
        return callback;
      }
    } catch (error) {
      return response(500, {
        status: 'error',
        data: {
          message: error.message || 'Internal server error',
        },
      });
    }
  }
  return handler(event);
};

export default withMiddlewares;

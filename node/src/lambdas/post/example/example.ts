import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { response } from '../../../utils/faas/response';
import withMiddlewares from '../../../utils/faas/with-middlewares';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return response(200, {
      status: 'success',
      data: event,
    });
  } catch (error) {
    return response(500, {
      error: `${error}`,
      status: 'error',
      data: {
        message: error.message || 'Internal server error',
      },
    });
  }
};

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withMiddlewares(event, [], handler);
};

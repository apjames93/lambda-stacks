import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { response } from '../../utils/faas/response';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let result;
  try {
    result = await loadFunction(event);

    if (result.default) {
      if (typeof result.default === 'function') {
        return result.default(event);
      }
      if (typeof result.default?.default === 'function') {
        return result.default.default(event);
      }
    }

    return result;
  } catch (error) {
    return response(error.statusCode || 500, {
      error,
      message: 'FAAS ERROR',
      status: 'error',
      data: {
        result,
        message: error.message || 'FAAS ERROR',
      },
    });
  }
};

const getFunctionPath = (httpMethod: string, functionName: string): string => {
  const fName = `${functionName}/${functionName}`;

  return process.env.LOCAL_FAAS === 'true'
    ? `../${httpMethod}/${fName}`.toLowerCase()
    : `/opt/nodejs/lambdas/${httpMethod}/${fName}.js`.toLowerCase();
};

/**
 * Lazy loads the Lambda function based on the HTTP method and function name.
 * @param event - API Gateway Lambda Proxy Input Format
 * @returns API Gateway Lambda Proxy Output Format
 */
export const loadFunction = async (event: APIGatewayProxyEvent): Promise<any> => {
  let functionName = event.pathParameters.proxy;
  if (functionName[functionName.length - 1] === '/') {
    functionName = functionName.slice(0, -1);
  }
  const functionPath = getFunctionPath(event.httpMethod, functionName);

  try {
    return import(functionPath);
  } catch (error) {
    return response(500, {
      error,
      status: 'error',
      data: {
        message: error.message || 'Internal server error',
      },
    });
  }
};

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return lambdaHandler(event);
};

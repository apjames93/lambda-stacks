import { APIGatewayProxyEvent } from 'aws-lambda';

const DEFAULT_EVENT = {
  httpMethod: 'GET',
  headers: {},
  query: {},
  path: '/',
  pathParameters: {},
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  isBase64Encoded: false,
  stageVariables: {},
  requestContext: null,
  resource: null,
};

export function constructAPIGwEvent(event: any): APIGatewayProxyEvent {
  const body = JSON.stringify(event.body);
  return Object.assign({}, DEFAULT_EVENT, event, body);
}

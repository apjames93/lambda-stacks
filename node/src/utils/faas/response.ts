import { APIGatewayProxyResult } from 'aws-lambda';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, x-requested-with',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
};

/**
 * @param statusCode status code of the response
 * @param body object with any key value
 * @param headers subscriptionID - the id of the stripe subscription
 * @returns APIGatewayProxyResult closed db connection and returns a APIGatewayProxyResult with a statusCode, headers, body
 */
export const response = (statusCode: number, body: any, headers: any = {}): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { ...corsHeaders, ...headers },
    body: JSON.stringify({ ...body }),
  };
};

export default response;

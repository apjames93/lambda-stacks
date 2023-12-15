// tslint:disable:no-console

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createServer, Server } from 'http';
import { config } from 'dotenv-safe';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { lambdaHandler } from './lambdas/faas/faas';
import cors from 'cors';

try {
  config();
} catch (error) {
  console.error('Error loading environment variables:', error.message);
  process.exit(1);
}

const app = express();
const port = 9000;

app.use(bodyParser.json());
app.use(cors());

app.all('/faas/*', async (req: Request, res: Response): Promise<any> => {
  console.log('in /faas/*');
  const event: APIGatewayProxyEvent = {
    body: JSON.stringify(req.body),
    headers: {
      Authorization: req.headers.authorization,
    },
    httpMethod: req.method,
    isBase64Encoded: false,
    path: req.path,
    pathParameters: {
      proxy: req.params['0'],
    },
    queryStringParameters: req.query as any,
    requestContext: null,
    resource: '',
    stageVariables: null,
    multiValueHeaders: undefined,
    multiValueQueryStringParameters: undefined,
  };

  const lambda = await lambdaHandler(event);
  console.log('lambda = ' + JSON.stringify(lambda));
  res.status(lambda.statusCode);
  res.send(lambda.body);
});

const server: Server = createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on('SIGINT', () => {
  console.log('Server shutting down');
  server.close();
  process.exit();
});

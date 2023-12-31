// tslint:disable:no-console

import { APIGatewayProxyEvent } from 'aws-lambda';
import bodyParser from 'body-parser';
import { config } from 'dotenv-safe';
import cors from 'cors';
import { createServer, Server } from 'http';
import { lambdaHandler } from './lambdas/faas/faas';
import express, { Request, Response } from 'express';

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

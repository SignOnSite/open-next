import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import * as http from 'http';
import { Writable } from 'stream';

type Handler = (
  event: APIGatewayProxyEventV2,
  responseStream: Writable,
  context: Context
) => Promise<any>;

interface Metadata {
  statusCode: number;
  headers: Record<string, string>;
}

declare global {
  namespace awslambda {
    function streamifyResponse(handler: Handler): any;
    module HttpResponseStream {
      function from(res: Writable, metadata: Metadata): any;
    }
  }
}
